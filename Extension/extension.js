const CRAWLED_MARKER = "auto-transcribed";

const shwa = {
  codePointRange: "U+E000-E1FF",
  families: [
    {
      names: ["Times New Roman", "Georgia"],
      fonts: [
        {
          weight: "normal",
          style: "normal",
          file: "YousufShwaAlphabet-2.otf"
        }
      ]
    },
    {
      names: ["Arial"],
      fonts: [
        { weight: "normal", style: "normal", file: "DushanShwaAlphabet.otf" },
        { weight: "bold", style: "normal", file: "DushanShwaAlphabetB.otf" }
      ]
    },
    {
      names: ["Verdana"],
      fonts: [
        {
          weight: "normal",
          style: "normal",
          file: "YousufShwaLigature.otf"
        }
      ]
    }
  ]
};

// Keys cannot contain special RegExp characters
const generic_font_dict = {
  "serif":      ["Times New Roman", "Georgia", "DejaVu Serif"],
  "sans-serif": ["Helvetica", "Arial"],
  "monospace":  ["Courier New", "Courier", "Ubuntu Monospace"],
  "cursive":    ["Apple Chancery", "URW Chancery L"],
  "fantasy":    ["Luminari", "Trattatello", "Papyrus"],
  "system-ui":  ["Helvetica", "Arial"]
};

window.browser = (function () {
  return window.safari ||
  window.msBrowser ||
    window.browser ||
    window.chrome;
})();

// Resources shim for Safari
if (!browser.runtime) {
  browser.runtime = {
    getURL: (relativeUrl) => browser.extension.baseURI + relativeUrl
  };
}

document.addEventListener("DOMContentLoaded", function(event) {
  crawl(document.body);
});

document.documentElement.appendChild(createStyle(shwa));

function createStyle(alphabet) {
  var style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(createCss(alphabet)));
  return style;
}

function createCss(alphabet) {
  return `
body :not(svg):not(.${CRAWLED_MARKER}) {
  color: transparent !important;
}
${createFonts(alphabet)}
`;
}

function createFonts(alphabet) {
  var resultString = '';
  alphabet.families.forEach(family => {
    family.names.forEach(name => {
      family.fonts.forEach(font => {
        resultString += (
          `
@font-face {
    font-family: '${name}';
    src: url('${browser.runtime.getURL('font/'+font.file)}');
    font-weight: ${font.weight};
    font-style: ${font.style};
    unicode-range: ${alphabet.codePointRange};
}
`
        );
      });
    });
  });
  return resultString;
}

function crawl(element) {
  if (element.tagName.toUpperCase() == "SCRIPT") {
    return;
  }
  const originalText = element.textContent;
  var promises = [];
  element.childNodes.forEach(child => {
    if (child.firstChild) {
      setTimeout(() => crawl(child));
    } else {
      promises.push(transcribeNode(child));
    }
  });
  if (element.classList) {
    const genericFontReplacements = generic_font_dict[window
                                  .getComputedStyle(element)
                                  .fontFamily
                                  .toLowerCase()];
    if (genericFontReplacements) {
      element.style.fontFamily = genericFontReplacements.map(name => `"${name}"`)
                                                     .join(', ');
    }
    Promise.all(promises).then(results => {
      const titleable =
        element.tagName && element.tagName.toUpperCase() != "DIV";
      if (titleable && results.some(result => result.text_node)) {
        // element.title = originalText;
      }
      element.classList.add(CRAWLED_MARKER);
    });
  }
}

function transcribeNode(node) {

  if (node.textContent && /\S/.test(node.textContent)) {
    return transcribe(node.textContent).then(newText => {
      node.textContent = newText;
      return { text_node: true };
    });
  } else {
    return Promise.resolve({ text_node: false });
  }
}
