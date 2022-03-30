const View = function () {};

View.prototype.render = function (data, render = true) {
  if (!data || (Array.isArray(data) && data.length === 0))
    return this.renderError();
  this._data = data;
  const markup = this._generateMarkup();

  if (!render) return markup;

  this._clear();
  this._parentElement.insertAdjacentHTML("afterbegin", markup);
  this._handleFPComponents();
};

View.prototype._clear = function () {
  this._parentElement.innerHTML = "";
};

View.prototype.renderError = function (message = this._errorMessage) {
  const markup = `
        <div class="error">
            <div>
                <svg>
                </svg>
            </div>
            <p>${message}</p>
        </div>
    `;

  // const markup=`
  //     <div class="error">
  //         <div>
  //             <svg>
  //                 <use href="${icons}#icon-alert-triangle"></use>
  //             </svg>
  //         </div>
  //         <p>${message}</p>
  //     </div>
  // `;
  this._clear();
  this._parentElement.insertAdjacentHTML("afterbegin", markup);
};

View.prototype.renderMessage = function (message = this._message) {
  const markup = `
        <div class="message">
            <div>
                <svg>
                    <use href="${icons}#icon-smile"></use>
                </svg>
            </div>
            <p>${message}</p>
        </div>
    `;
  this._clear();
  this._parentElement.insertAdjacentHTML("afterbegin", markup);
};

View.prototype._handleFPComponents = function () {};
