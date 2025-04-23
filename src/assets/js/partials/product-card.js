import BasePage from '../base-page';
class ProductCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Parse product data
    this.product = this.product || JSON.parse(this.getAttribute('product'));

    if (window.app?.status === 'ready') {
      this.onReady();
    } else {
      document.addEventListener('theme::ready', () => this.onReady());
    }
  }

  onReady() {
    this.fitImageHeight = salla.config.get('store.settings.product.fit_type');
    this.placeholder = salla.url.asset(
      salla.config.get('theme.settings.placeholder')
    );
    this.getProps();

    this.source = salla.config.get('page.slug');
    // If the card is in the landing page, hide the add button and show the quantity
    if (this.source == 'landing-page') {
      this.hideAddBtn = true;
      this.showQuantity = window.showQuantity;
    }

    salla.lang.onLoaded(() => {
      // Language
      this.remained = salla.lang.get('pages.products.remained');
      this.donationAmount = salla.lang.get('pages.products.donation_amount');
      this.startingPrice = salla.lang.get('pages.products.starting_price');
      this.addToCart = salla.lang.get('pages.cart.add_to_cart');
      this.outOfStock = salla.lang.get('pages.products.out_of_stock');

      // re-render to update translations
      this.render();
    });

    this.render();
  }
  has3dImage() {
    return this.product.images?.filter((item) => item.three_d_image_url).length
      ? true
      : false;
  }
  renderImages(images) {
    let limit = productcard_images_limit
      ? productcard_images_limit
      : images.length;
      let sliderConfig = JSON.stringify({
        effect: 'fade',
        speed: 500
      });
    this.querySelector('.product-slider').innerHTML = `<salla-slider id="product-slider-${this.product.id}-${this.getRandomInt(1, 10000)}" show-controls="true" auto-play=${productcard_autoplay ? 'true' : 'false'} class="h-full [&_.swiper]:h-full [&_.swiper]:!m-0 [&_.swiper]:!p-0 [&_.swiper-wrapper]:!p-0 product-slider-fade" slider-config='${sliderConfig}'>
          <div slot="items">
            <img class="s-product-card-image-${salla.url.is_placeholder(this.product?.image?.url)? 'contain': this.fitImageHeight? this.fitImageHeight: 'cover'} lazy" src=${this.placeholder} alt=${this.product?.image?.alt} data-src=${this.product?.image?.url || this.product?.thumbnail} loading="lazy" width="500" height="500"/>
            ${images.slice(1, limit) ?.map(
                (image) =>
                  `<img data-src=${image.url} src=${this.placeholder} alt=${image?.alt} class="s-product-card-image-${salla.url.is_placeholder(this.product?.image?.url)? 'contain': this.fitImageHeight? this.fitImageHeight: 'cover'} lazy" loading="lazy" width="500" height="500"/>`
              )}
          </div>
        </salla-slider>`;
  }
  initCircleBar() {
    let qty = this.product.quantity,
      total = this.product.quantity > 100 ? this.product.quantity * 2 : 100,
      roundPercent = (qty / total) * 100,
      bar = this.querySelector('.s-product-card-content-pie-svg-bar'),
      strokeDashOffsetValue = 100 - roundPercent;
    bar.style.strokeDashoffset = strokeDashOffsetValue;
  }

  formatDate(date) {
    let d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  getProductBadge() {
    if (this.product.promotion_title) {
      return `<div class="s-product-card-promotion-title">${this.product.promotion_title}</div>`;
    }
    if (this.showQuantity && this.product?.quantity) {
      return `<div
        class="s-product-card-quantity">${this.remained} ${salla.helpers.number(
        this.product?.quantity
      )}</div>`;
    }
    if (this.showQuantity && this.product?.is_out_of_stock) {
      return `<div class="s-product-card-out-badge">${this.outOfStock}</div>`;
    }
    return '';
  }

  getPriceFormat(price) {
    if (!price || price == 0) {
      return salla.config.get('store.settings.product.show_price_as_dash')
        ? '-'
        : '';
    }

    return salla.money(price);
  }

  getProductPrice() {
    let price = '';
    if (this.product.is_on_sale) {
      price = `<div class="s-product-card-sale-price">
                <h4>${this.getPriceFormat(this.product.sale_price)}</h4>
                <span>${this.getPriceFormat(this.product?.regular_price)}</span>
              </div>`;
    } else if (this.product.starting_price) {
      price = `<div class="s-product-card-starting-price">
                  <p>${this.startingPrice}</p>
                  <h4> ${this.getPriceFormat(
                    this.product?.starting_price
                  )} </h4>
              </div>`;
    } else {
      price = `<h4 class="s-product-card-price">${this.getPriceFormat(
        this.product?.price
      )}</h4>`;
    }

    return price;
  }

  getAddButtonLabel() {
    if (this.product.status === 'sale' && this.product.type === 'booking') {
      return salla.lang.get('pages.cart.book_now');
    }

    if (this.product.status === 'sale') {
      return salla.lang.get('pages.cart.add_to_cart');
    }

    if (this.product.type !== 'donating') {
      return salla.lang.get('pages.products.out_of_stock');
    }

    // donating
    return salla.lang.get('pages.products.donation_exceed');
  }

  getProps() {
    /**
     *  Horizontal card.
     */
    this.horizontal = this.hasAttribute('horizontal');

    /**
     *  Support shadow on hover.
     */
    this.shadowOnHover = this.hasAttribute('shadowOnHover');

    /**
     *  Hide add to cart button.
     */
    this.hideAddBtn = this.hasAttribute('hideAddBtn');

    /**
     *  Full image card.
     */
    this.fullImage = this.hasAttribute('fullImage');
    this.noImage = this.hasAttribute('noImage');

    /**
     *  Minimal card.
     */
    this.minimal = this.hasAttribute('minimal')|| this.closest('[minimal]') !== null;

    /**
     *  Special card.
     */
    this.isSpecial = this.hasAttribute('isSpecial');

    /**
     *  Show quantity.
     */
    this.showQuantity = this.hasAttribute('showQuantity');
  }
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  render() {
    this.classList.add('s-product-card-entry', '!rounded-none');
    this.setAttribute('id', this.product.id);
    !this.horizontal && !this.fullImage && !this.minimal
      ? this.classList.add('s-product-card-vertical')
      : '';
    this.horizontal && !this.fullImage && !this.minimal
      ? this.classList.add('s-product-card-horizontal')
      : '';
    this.fitImageHeight && !this.isSpecial && !this.fullImage && !this.minimal
      ? this.classList.add('s-product-card-fit-height')
      : '';
    this.isSpecial ? this.classList.add('s-product-card-special') : '';
    this.fullImage ? this.classList.add('s-product-card-full-image') : '';
    this.minimal ? this.classList.add('s-product-card-minimal') : '';
    this.product?.donation ? this.classList.add('s-product-card-donation') : '';
    this.shadowOnHover ? this.classList.add('s-product-card-shadow') : '';
    this.product?.is_out_of_stock
      ? this.classList.add('s-product-card-out-of-stock')
      : '';
    this.isInWishlist =
      !salla.config.isGuest() &&
      salla.storage.get('salla::wishlist', []).includes(this.product.id);
    const hasOptions = productcard_options && this.product.options?.length;
    const hasImagesSlider =
      product_images_layout == 'slider' && this.product.images?.length > 1;
    const hasMetadata = productcard_metadata && this.product.metadata;
    this.innerHTML = `
        <div class=" !rounded-none ${!this.fullImage ? 's-product-card-image-full h-full' : ''} ${ this.horizonta || this.minimal? 'flex-1' : 'aspect-[0.67]'}">
          <a href="${this.product?.url}" class="relative h-full block">
        ${
          product_images_layout == 'slider' &&
          this.product.images?.length > 1 &&
          !this.fullImage &&
          !this.noImage
            ? `<div class="product-slider h-full hidden md:flex"></div>
              <img class="flex md:hidden s-product-card-image-${
                salla.url.is_placeholder(this.product?.image?.url)
                  ? 'contain'
                  : this.fitImageHeight
                  ? this.fitImageHeight
                  : 'cover'
              } lazy"
                src=${this.placeholder}
                alt=${this.product?.image?.alt}
                data-src=${this.product?.image?.url || this.product?.thumbnail}
              />
            `
            : `<img class="s-product-card-image-${
                salla.url.is_placeholder(this.product?.image?.url)
                  ? 'contain'
                  : this.fitImageHeight
                  ? this.fitImageHeight
                  : 'cover'
              } lazy h-full"
                src=${this.placeholder}
                alt=${this.product?.image?.alt}
                data-src=${this.product?.image?.url || this.product?.thumbnail}
              />
              ${
                product_images_layout == 'change-with-hover' &&
                this.product.images?.length > 1
                  ? `<img alt=${this.product?.name} src=${
                      this.placeholder
                    } data-src=${
                      this.product.images[1].url
                    } class="!absolute top-0 left-0 transition-opacity duration-300 !opacity-0 group-hover:!opacity-100 s-product-card-image-${
                      salla.url.is_placeholder(this.product?.image?.url)
                        ? 'contain'
                        : this.fitImageHeight
                        ? this.fitImageHeight
                        : 'cover'
                    } lazy"/>`
                  : ``
              }
              `
        }

            ${!this.fullImage && !this.minimal ? this.getProductBadge() : ''}

            ${
              this.has3dImage() && productcard_show_3d_icon
                ? '<span class="sicon-d-rotate s-product-card-3d-icon"></span>'
                : ''
            }
          </a>
          ${
            this.fullImage
              ? `<a href="${this.product?.url}" aria-label=${this.product.name} class="s-product-card-overlay"></a>`
              : ''
          }
        </div>
        <div class="s-product-card-content">
          ${
            this.isSpecial && this.product?.quantity
              ? `<div class="s-product-card-content-pie">
              <span>
                <b>${salla.helpers.number(this.product?.quantity)}</b>
                ${this.remained}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -1 36 34" class="s-product-card-content-pie-svg">
                <circle cx="16" cy="16" r="15.9155" class="s-product-card-content-pie-svg-base" />
                <circle cx="16" cy="16" r="15.9155" class="s-product-card-content-pie-svg-bar" />
              </svg>
            </div>`
              : ``
          }

          <div class="s-product-card-content-main ${
            this.isSpecial ? 's-product-card-content-extra-padding' : ''
          }">
            <h3 class="s-product-card-content-title line-clamp-1 md:line-clamp-2">
              <a href="${this.product?.url}">${this.product?.name}</a>
            </h3>

            ${
              this.product?.subtitle && !this.minimal
                ? `<p class="s-product-card-content-subtitle opacity-80">${this.product?.subtitle}</p>`
                : ``
            }
          </div>
          ${
            this.product?.donation && !this.minimal && !this.fullImage
              ? `<salla-progress-bar donation=${JSON.stringify(
                  this.product?.donation
                )}></salla-progress-bar>
          <div class="s-product-card-donation-input">
            ${
              this.product?.donation?.can_donate
                ? `<label for="donation-amount-${this.product.id}">${
                    this.donationAmount
                  } <span>*</span></label>
              <input
                type="text"
                onInput="${(e) => {
                  salla.helpers.inputDigitsOnly(e.target);
                  this.addBtn.donatingAmount = e.target.value;
                }}"
                id="donation-amount-${this.product.id}"
                name="donating_amount"
                class="s-form-control"
                placeholder="${this.donationAmount}" />`
                : ``
            }
          </div>`
              : ''
          }
          <div class="s-product-card-content-sub ${
            this.isSpecial ? 's-product-card-content-extra-padding' : ''
          }">
            ${this.product?.donation?.can_donate ? '' : this.getProductPrice()}
            ${
              this.product?.rating?.stars
                ? `<div class="s-product-card-rating">
                <i class="sicon-star2 before:text-orange-300"></i>
                <span>${this.product.rating.stars}</span>
              </div>`
                : ``
            }
          </div>

          ${
            this.isSpecial && this.product.discount_ends
              ? `<salla-count-down date="${this.formatDate(
                  this.product.discount_ends
                )}" end-of-day=${true} boxed=${true}
              labeled=${true} />`
              : ``
          }
        </div>
      `;

    this.querySelectorAll('[name="donating_amount"]').forEach((element) => {
      element.addEventListener('input', (e) => {
        e.target
          .closest('.s-product-card-content')
          .querySelector('salla-add-product-button')
          .setAttribute('donating-amount', e.target.value);
      });
    });

    document.lazyLoadInstance?.update(this.querySelectorAll('.lazy'));
    // Render Images
    if (hasImagesSlider && this.querySelector('.product-slider')) {
      this.renderImages(this.product.images);
    }

    // Render Options
    if (hasOptions && this.querySelector('.product-options')) {
      this.renderOptions(this.product.options);
    }

    // Render Metadata
    if (hasMetadata && this.querySelector('.product-metadata')) {
      this.renderMetadata(this.product.metadata);
    }
    if (this.product?.quantity && this.isSpecial) {
      this.initCircleBar();
    }
  }
}

customElements.define('custom-salla-product-card', ProductCard);
