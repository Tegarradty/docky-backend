export default class CodeBlockTool {
  static get toolbox() {
    return {
      title: "Code Block",
      icon: "</>",
    };
  }

  static get enableLineBreaks() {
    return true;
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data, readOnly }) {
    this.data = data || { code: "" };
    this.readOnly = readOnly;
    this.wrapper = null;
    this.textarea = null;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.className = "code-block-tool";

    const header = document.createElement("div");
    header.className = "code-block-header";
    header.textContent = "Code Block";

    const textarea = document.createElement("textarea");
    textarea.className = "code-block-textarea";
    textarea.placeholder = "Tulis kode di sini...";
    textarea.value = this.data.code || "";
    textarea.readOnly = !!this.readOnly;
    textarea.spellcheck = false;

    textarea.addEventListener("input", (event) => {
      this.data.code = event.target.value;
    });

    textarea.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    textarea.addEventListener("mousedown", (event) => {
      event.stopPropagation();
    });

    wrapper.appendChild(header);
    wrapper.appendChild(textarea);

    this.wrapper = wrapper;
    this.textarea = textarea;

    return wrapper;
  }

  save() {
    return {
      code: this.textarea ? this.textarea.value : "",
    };
  }

  validate(savedData) {
    return typeof savedData.code === "string";
  }

  focus() {
    if (this.textarea && !this.readOnly) {
      this.textarea.focus();
    }
  }
}