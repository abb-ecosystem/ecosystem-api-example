const EditSignalView = function () {
  View.call(this);

  this._parentElement = document.querySelector("#edit");
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

EditSignalView.prototype.addHandlerEdit = function (handler) {
  this._parentElement.addEventListener("submit", function (e) {
    e.preventDefault();
    const dataArr = [...new FormData(this)];
    const data = Object.fromEntries(dataArr);
    handler(data);
  });
};

EditSignalView.prototype.initDeviceDropdown = function (devices) {
  this._modalDeviceDropDown.model = { items: devices };
};

EditSignalView.prototype.addHandlerRender = function (update) {
  const cbOnSelection = function (index, obj) {
    const attr = {
      name: this._data.name,
      type: this._data.type,
      device:
        this._modalDeviceDropDown.model.items[
          this._modalDeviceDropDown.selected
        ],
      map: this._modalMapInput.text,
    };

    if (update(this._data, attr)) return;

    // if the update was unsuccessful, then restore old value
    this._modalDeviceDropDown.selected =
      this._modalDeviceDropDown.model.items.indexOf(this._data.device);
  };

  this._modalDeviceDropDown.onselection = cbOnSelection.bind(this);

  const cbOnChange = function (text) {
    const attr = {
      name: this._data.name,
      type: this._data.type,
      device:
        this._modalDeviceDropDown.model.items[
          this._modalDeviceDropDown.selected
        ],
      map: text,
    };

    if (update(this._data, attr)) return;

    // if the update was unsuccessful, then restore old value
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
        <div id="modal-signal-name" class="cols-4"><p>${this._data.signalName}</p></div>
        <div id="modal-signal-type" class="cols-4"><p>${this._data.signalType}</p></div>
        <div id="modal-signal-device" class="cols-4"><div></div></div>
        <div id="modal-signal-map" class="cols-4"><div></div></div>
    </div>
    `;

  this._modalDeviceDropDown.selected =
    this._modalDeviceDropDown.model.items.indexOf(this._data.signalDevice);
  this._modalMapInput.text = this._data.signalMap;

  return markup;
};

EditSignalView.prototype._handleFPComponents = function () {
  this._modalDeviceDropDown.attachToId("modal-signal-device");
  this._modalMapInput.attachToId("modal-signal-map");
};

window.editSignalView = new EditSignalView();
