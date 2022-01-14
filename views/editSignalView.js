const EditSignalView = function () {
  View.call(this);

  this._parentElement = document.querySelector(".modal-content"); // this has to be a <form></form>
  this._errorMessage = "Error while editing signal 😆!";
  this._message = "";

  this._window = document.querySelector(".modal");
  this._overlay = document.querySelector(".overlay");
  this._btnsOpen = document.querySelectorAll(".btn-edit-signal");
  this._btnClose = document.querySelector(".close-modal");

  this._modalDeviceDropDown = new FPComponents.Dropdown_A();
  this._modalMapInput = new FPComponents.Input_A();

  this._modalMapInput.regex = /^-?[0-9]+(\.[0-9]+)?$/;

  this._addHandlerHideWindow();
};

EditSignalView.prototype = Object.create(View.prototype);

EditSignalView.prototype.openWindow = function (e) {
  const btn = e.target.closest(".btn-edit-signal");
  if (btn) {
    this.render(btn.dataset);
  }

  this.toggleWindow();
};

EditSignalView.prototype.toggleWindow = function () {
  this._overlay.classList.toggle("hidden");
  this._window.classList.toggle("hidden");
};

EditSignalView.prototype.addHandlersShowWindow = function () {
  this._btnsOpen = document.querySelectorAll(".btn-edit-signal");

  Array.from(this._btnsOpen).forEach((node) =>
    node.addEventListener("click", this.openWindow.bind(this))
  );
};

EditSignalView.prototype._addHandlerHideWindow = function () {
  this._btnClose.addEventListener("click", this.toggleWindow.bind(this));
  this._overlay.addEventListener("click", this.toggleWindow.bind(this));
};

EditSignalView.prototype.initDeviceDropdown = function (devices) {
  this._modalDeviceDropDown.model = { items: devices };
};

EditSignalView.prototype.addHandlerRender = function (update) {
  const cbOnSelection = function (index, obj) {
    this._warning.textContent = "";
    const attr = {
      name: this._data.name,
      type: this._data.type,
      device:
        this._modalDeviceDropDown.model.items[
          this._modalDeviceDropDown.selected
        ],
      map: this._modalMapInput.text,
    };

    const response = update(this._data, attr);

    if (!response) return;

    // if the update was unsuccessful, then restore old value
    this._warning.textContent = response;

    this._modalDeviceDropDown.selected =
      this._modalDeviceDropDown.model.items.indexOf(this._data.device);
  };

  this._modalDeviceDropDown.onselection = cbOnSelection.bind(this);

  const cbOnChange = function (text) {
    this._warning.textContent = "";

    const attr = {
      name: this._data.name,
      type: this._data.type,
      device:
        this._modalDeviceDropDown.model.items[
          this._modalDeviceDropDown.selected
        ],
      map: text,
    };

    const response = update(this._data, attr);

    if (!response) return;

    // if the update was unsuccessful, then restore old value
    this._warning.textContent = response;

    this._modalMapInput.text = this._data.map;
  };
  this._modalMapInput.onchange = cbOnChange.bind(this);
};

EditSignalView.prototype._generateMarkup = function () {
  const markup = `
    <div class="row">
        <div class="cols-4"><h3> Signal Name</h3></div>
        <div class="cols-4"><h3>Type</h3></div>
        <div class="cols-4"><h3>Device</h3></div>
        <div class="cols-4"><h3>Map</h3></div>
    </div>
    <div class="row">
        <div class="cols-4"><p class="modal-signal-name">${this._data.name}</p></div>
        <div class="cols-4"><p class="modal-signal-type">${this._data.type}</p></div>
        <div class="cols-4"><div id="modal-signal-device"></div></div>
        <div class="cols-4"><div id="modal-signal-map"></div></div>
    </div>
    <div class="row">
      <div class="cols-1">
        <button class="btn center">
          <span>Upload</span>
        </button>
      </div>
    </div>
    <div class="row">
      <div class="cols-1">
        <h3 class="modal-warning"></h3>
      </div>
    </div>
    `;

  this._modalDeviceDropDown.selected =
    this._modalDeviceDropDown.model.items.indexOf(this._data.device);
  this._modalMapInput.text = this._data.map;

  return markup;
};

EditSignalView.prototype._handleFPComponents = function () {
  this._modalDeviceDropDown.attachToId("modal-signal-device");
  this._modalMapInput.attachToId("modal-signal-map");
  this._warning = this._parentElement.querySelector(".modal-warning");
};

EditSignalView.prototype.addHandlerUpdate = function (handler) {
  const cbUpdate = function (e) {
    e.preventDefault();
    const attr = [];
    attr.name = e.target.querySelector(".modal-signal-name").textContent;
    attr.type = e.target.querySelector(".modal-signal-type").textContent;
    attr.device =
      this._modalDeviceDropDown.model.items[this._modalDeviceDropDown.selected];
    attr.map = this._modalMapInput.text;
    handler(attr);
    this.toggleWindow();
  };
  this._parentElement.addEventListener("submit", cbUpdate.bind(this));
};

window.editSignalView = new EditSignalView();
