import 'lite-youtube-embed';
import BasePage from './base-page';
import Fslightbox from 'fslightbox';
window.fslightbox = Fslightbox;
import { zoom } from './partials/image-zoom';

class Product extends BasePage {
  onReady() {
    app.watchElements({
      totalPrice: '.total-price',
      beforePrice: '.before-price',
      startingPriceTitle: '.starting-price-title'
    });

    this.initProductOptionValidations();
    this.displayProductOptions();
    this.initFeaturedTabs();
    this.goToProductByArrows();
    this.generalEffectOnHover();
    this.accordionMetadata();
    this.selectBranches();

    if (imageZoom) {
      // call the function when the page is ready
      this.initImagesZooming();
      // listen to screen resizing
      window.addEventListener('resize', () => this.initImagesZooming());
    }
  }

  initProductOptionValidations() {
    document
      .querySelector('.product-form')
      ?.addEventListener('change', function () {
        this.reportValidity() && salla.product.getPrice(new FormData(this));
      });
  }

  initImagesZooming() {
    // skip if the screen is not desktop or if glass magnifier
    // is already crated for the image before
    const imageZoom = document.querySelector(
      '.image-slider .magnify-wrapper.swiper-slide-active .img-magnifier-glass'
    );
    if (window.innerWidth < 1024 || imageZoom) return;
    setTimeout(() => {
      // set delay after the resizing is done, start creating the glass
      // to create the glass in the proper position
      const image = document.querySelector(
        '.image-slider .swiper-slide-active img'
      );
      zoom(image?.id, 2);
    }, 250);

    document
      .querySelector('salla-slider.details-slider')
      .addEventListener('slideChange', (e) => {
        // set delay till the active class is ready
        setTimeout(() => {
          const imageZoom = document.querySelector(
            '.image-slider .swiper-slide-active .img-magnifier-glass'
          );

          // if the zoom glass is already created skip
          if (window.innerWidth < 1024 || imageZoom) return;
          const image = document.querySelector(
            '.image-slider .magnify-wrapper.swiper-slide-active img'
          );
          zoom(image?.id, 2);
        }, 250);
      });
  }
  displayProductOptions() {
    salla.event.on('product-options::change', (event) => {
      let option = event.event.target,
        optionValue = option.value,
        optionId = event.option.id,
        type = event.option.type,
        optionName = event.option.name,
        price = event.detail ? event.detail.additional_price : '',
        optionPrice = price
          ? '+ ' +
            price +
            ' ' +
            salla.config.currency(salla.config.get('user.currency_code')).symbol
          : '',
        optionText = event.detail ? event.detail.name : '';
      if (type == 'file' || type == 'notes' || type == 'image') return; // we'll push it's data from
      if (
        [
          'text',
          'number',
          'textarea',
          'date',
          'time',
          'datetime',
          'hidden'
        ].includes(type)
      ) {
        optionText = optionValue;
      } else if (type == 'radio') {
        optionId = option.dataset.optionId;
      } else if (type == 'color') {
        optionText =
          `<span style='background-color:${event.detail.color}' class='w-4 h-4 mx-1 inline-block -mb-0.5'></span>` +
          optionText;
      } else if (type == 'thumbnail') {
        optionText =
          `<img src='${event.detail.image}' class='w-4 h-4 mx-1 inline-block object-cover'/>` +
          optionText;
      } else if (type == 'multiple-options') {
        option.setAttribute('data-option-inner-text', optionText);
        option.setAttribute(
          'data-option-price-noformate',
          event.detail.additional_price
        );
        let checkboxes = document.getElementsByName(option.name),
          vals = '',
          price = 0;
        for (var i = 0; i < checkboxes.length; i++) {
          if (checkboxes[i].checked) {
            vals += ', ' + checkboxes[i].dataset.optionInnerText;
            price += checkboxes[i].dataset.optionPriceNoformate * 1;
          }
        }
        optionText = vals ? vals.substring(1) : '';
        optionPrice = price
          ? '+ ' +
            price +
            ' ' +
            salla.config.currency(salla.config.get('user.currency_code')).symbol
          : '';
      }
      this.setOptionsInLocal(
        option,
        optionName,
        optionId,
        optionText,
        optionPrice,
        optionValue
      );
    });
  }

  setOptionsInLocal(
    option,
    optionName,
    optionId,
    optionText,
    optionPrice,
    optionValue
  ) {
    let arrayOptions =
      JSON.parse(
        localStorage.getItem(
          'product-' + salla.config.get('page').id + '-options'
        )
      ) || [];
    if (
      option?.hasAttribute('nothing') ||
      (option?.type == 'checkbox' && optionText == '') ||
      optionValue == ''
    ) {
      arrayOptions.forEach((item) => {
        if (item.optionId == optionId) {
          let index = arrayOptions.indexOf(item);
          arrayOptions.splice(index, 1);
        }
      });
    } else {
      let optionExit = false;
      arrayOptions.forEach((item) => {
        if (item.optionId == optionId) {
          item.optionText = optionText;
          item.optionPrice = optionPrice;
          item.optionValue = optionValue;
          item.optionId = optionId;
          optionExit = true;
          return;
        }
      });
      if (!optionExit) {
        arrayOptions.push({
          optionName: optionName,
          optionText: optionText,
          optionPrice: optionPrice,
          optionValue: optionValue,
          optionId: optionId
        });
      }
    }

    let OptionsMenu = arrayOptions.map(function (item) {
      return `<div class="flex items-center justify-between font-normal first:hidden text-sm mt-2 pt-2"><span class="text-sm flex items-center"><span class="text-primary">${item.optionName} : </span> <span class="mx-1"> ${item.optionText} </span></span><span class="flex gap-3 items-center"><span class="font-bold">${item.optionPrice}</span></span></div>`;
    });
    OptionsMenu = OptionsMenu.join('');
    document.getElementById('options-menu').innerHTML = OptionsMenu;
    localStorage.setItem(
      'product-' + salla.config.get('page').id + '-options',
      JSON.stringify(arrayOptions)
    );
  }
  registerEvents() {
    salla.event.on('product::price.updated.failed', () => {
      app.element('.price-wrapper').classList.add('hidden');
      app.element('.out-of-stock').classList.remove('hidden');
      app.anime('.out-of-stock', { scale: [0.88, 1] });
    });
    salla.product.event.onPriceUpdated((res) => {
      app.element('.out-of-stock').classList.add('hidden');
      app.element('.price-wrapper').classList.remove('hidden');

      let data = res.data,
        is_on_sale = data.has_sale_price && data.regular_price > data.price;

      app.startingPriceTitle?.classList.add('hidden');

      app.totalPrice.forEach((el) => {
        el.innerText = salla.money(data.price);
      });
      app.beforePrice.forEach((el) => {
        el.innerText = salla.money(data.regular_price);
      });

      app.toggleClassIf(
        '.price_is_on_sale',
        'showed',
        'hidden',
        () => is_on_sale
      );
      app.toggleClassIf(
        '.starting-or-normal-price',
        'hidden',
        'showed',
        () => is_on_sale
      );

      app.anime('.total-price', { scale: [0.88, 1] });
    });

    app.onClick(
      '#btn-show-more',
      (e) =>
        app.all('#more-content', (div) => {
          e.target.classList.add('is-expanded');
          div.style = `max-height:${div.scrollHeight}px`;
        }) || e.target.remove()
    );
  }
  lessOptionsErrorMessage() {
    const form = document.querySelector('#single-product-form');
    document
      .querySelector('.add-single-product-page')
      .addEventListener('click', (event) => {
        event.preventDefault();
        if (form.reportValidity()) {
          const formdata = new FormData(form);
          formdata.append(
            'quantity',
            document.querySelector('.s-quantity-input-input').value
          );
          salla.cart.addItem(formdata);
        } else if (!document.querySelector('.product-out-of-stock')) {
          salla.error(salla.lang.get('common.messages.required_fields'));
        }
      });
  }
  initFeaturedTabs() {
    app.all('.tab-trigger', (el) => {
      el.addEventListener('click', ({ currentTarget: btn }) => {
        let id = btn.dataset.componentId;
        // btn.setAttribute('fill', 'solid');
        app
          .toggleClassIf(
            `#${id} .tabs-wrapper>div`,
            'is-active opacity-0 translate-y-3',
            'inactive',
            (tab) => tab.id == btn.dataset.target
          )
          .toggleClassIf(
            `#${id} .tab-trigger`,
            'is-active',
            'inactive',
            (tabBtn) => tabBtn == btn
          );

        // fadeIn active tabe
        setTimeout(
          () =>
            app.toggleClassIf(
              `#${id} .tabs-wrapper>div`,
              'opacity-100 translate-y-0',
              'opacity-0 translate-y-3',
              (tab) => tab.id == btn.dataset.target
            ),
          100
        );
      });
    });
    document
      .querySelectorAll('.s-block-tabs')
      .forEach((block) => block.classList.add('tabs-initialized'));
  }
  goToProductByArrows() {
    let cat_id = document
      .querySelector('.go-to-product-by-arrows')
      .getAttribute('catId');
    let product_id = document
      .querySelector('.go-to-product-by-arrows')
      .getAttribute('productId');

    const queryParams = {
      source: 'categories',
      source_value: [cat_id]
    };

    salla.product
      .fetch(queryParams)
      .then((response) => {
        const products = response.data;

        if (!products || products.length <= 1) {
          document.querySelector('.go-to-product-by-arrows').style.display =
            'none';
          return;
        }

        products.forEach((product, index) => {
          if (product.id == product_id) {
            let prev_product = index > 0 ? products[index - 1] : null;
            let next_product =
              index < products.length - 1 ? products[index + 1] : null;
            const prevElement = document.querySelector(
              '.go-to-product-by-arrows .prev-product'
            );
            const nextElement = document.querySelector(
              '.go-to-product-by-arrows .next-product'
            );
            if (prev_product) {
              prevElement.style.display = 'block';
              prevElement
                .querySelector('a')
                .setAttribute('href', prev_product.url);
              prevElement.querySelector('.product-image').src =
                prev_product.image.url;
              prevElement.querySelector('.product-name').innerHTML =
                prev_product.name;
              prevElement.querySelector('.product-price').innerHTML =
                salla.money(prev_product.price);
            } else {
              prevElement.style.display = 'none';
            }
            if (next_product) {
              nextElement.style.display = 'block';
              nextElement
                .querySelector('a')
                .setAttribute('href', next_product.url);
              nextElement.querySelector('.product-image').src =
                next_product.image.url;
              nextElement.querySelector('.product-name').innerHTML =
                next_product.name;
              nextElement.querySelector('.product-price').innerHTML =
                salla.money(next_product.price);
            } else {
              nextElement.style.display = 'none';
            }
          }
        });
      })
      .catch((error) => {
        console.error('❌ خطأ في جلب المنتجات:', error);
      });
  }

  generalEffectOnHover() {
    document.querySelectorAll('.general-effect').forEach((item) => {
      let item_event_in = item.dataset.eventIn;
      let item_event_leave = item.dataset.eventLeave;
      let item_target = item.dataset.target;
      let targetElement = document.querySelector('#' + item_target);

      if (!targetElement) {
        console.warn(`Element with ID '${item_target}' not found.`);
        return;
      }

      item.addEventListener(item_event_in, () => {
        targetElement.classList.remove('opacity-0', 'translate-y-3');
      });

      item.addEventListener(item_event_leave, () => {
        targetElement.classList.add('opacity-0', 'translate-y-3');
      });
    });
  }
  accordionMetadata() {
    Salla.onReady(function () {
      if (!salla.url.is_page('product.single')) {
        return salla.logger.error(
          'This feature is not supported on this page!'
        );
      }

      const metadataContainer = document.getElementById('metadata-name');
      const productId = salla.config.get('page.id');

      if (!metadataContainer || !productId) {
        return salla.logger.error(
          'DOM element with ID `metadata-name` or product ID is missing',
          metadataContainer,
          productId
        );
      }

      salla.metadata.api
        .fetchValues('product', [productId])
        .then(({ data }) => {
          metadataContainer.innerHTML = data
            .map((meta) =>
              meta.sections
                .map(
                  (section) => `
                <div class="border-b border-darker">
                    <div class="accordion cursor-pointer group">
                      <span class="accordion-title flex justify-start items-center gap-4 py-3">
                      <i class="icone sicon-add"></i>
                      ${section.name}
                      </span>
                    </div>
                    <div class="panel overflow-hidden transition-all duration-700 mb-1 max-h-0">
                      ${section.fields
                        .map(
                          (field) => `
                            <div class="field">
                              <strong>${field.name}:</strong>
                              ${
                                field.type === 'file'
                                  ? `<img src="${field.value}" alt="${field.name}" class="field-image"/>`
                                  : `<span>${field.value}</span>`
                              }
                            </div>
                          `
                        )
                        .join('')}
                    </div>
                </div>
                `
                )
                .join('')
            )
            .join('');
            document.querySelectorAll('.accordion').forEach((accordion) => {
              accordion.addEventListener('click', function () {
                const activeAccordion =
                  document.querySelector('.accordion.active');
                if (activeAccordion && activeAccordion !== this) {
                  togglePanel(activeAccordion, false);
                }
                const isActive = this.classList.toggle('active');
                togglePanel(this, isActive);
              });
            });

            function togglePanel(accordion, open) {
              const panel = accordion.nextElementSibling;
              const icon = accordion.querySelector('.icone');
              if (!panel) return;
              if (open) {
                panel.style.display = 'block';
                let height = panel.scrollHeight;
                panel.style.maxHeight = height + 'px';
                panel.classList.add('is-opened');
              } else {
                panel.style.maxHeight = panel.scrollHeight + 'px';
                requestAnimationFrame(() => {
                  panel.style.maxHeight = '0';
                  panel.classList.remove('is-opened');
                });
              }
              if (icon) {
                icon.classList.toggle('sicon-minus', open);
                icon.classList.toggle('sicon-add', !open);
              }
            }
        })
        .catch((error) => {
          salla.logger.error('❌ خطأ في جلب بيانات الميتا:', error);
          metadataContainer.innerHTML = '<p>تعذر تحميل البيانات.</p>';
        });
    });
  }
  selectBranches(){
    let selectElement = document.getElementById("select-branches");
    if (!selectElement) return;
    let tabsItems = document.querySelectorAll(".select__item");
    tabsItems.forEach((item) => {
        item.classList.remove("is-active");
        item.style.display = "none";
    });
    let firstOptionValue = selectElement.value;
    let firstActiveTab = document.getElementById(firstOptionValue);
    if (firstActiveTab) {
        firstActiveTab.style.display = "block";
        firstActiveTab.classList.add("is-active");
    }
    selectElement.addEventListener("change", function () {
        let selectedValue = this.value;
        tabsItems.forEach((item) => {
            item.classList.remove("is-active");
            item.style.display = "none";
        });
        let activeTab = document.getElementById(selectedValue);
        if (activeTab) {
            activeTab.classList.add("is-active");
            activeTab.style.display = "block";
        }
    });
  }
}

Product.initiateWhenReady(['product.single']);
