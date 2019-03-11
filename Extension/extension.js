/* NEOSCRIPTS BROWSER EXTENSION

This extension has three components:
   1. A DOM crawler, which finds pieces of text on the page.
   2. A styler, which generates correct fonts as well as CSS to hide untranscribed text.
      - Uses font files for each alphabet
   3. A transcriber, which converts text into another alphabet.
      - Planned:
         - Use a phonemic dictionary for each dialect.
         - Use an alphabet map for each alphabet.
*/

extension();

function extension() {

   const environment = getEnvironment();
   const CRAWLED_MARKER = "auto-transcribed";
   const genericFontDictionary = getGenericFontDictionary();
   const shwaFonts = getShwaFonts();

   environment.document.addEventListener("DOMContentLoaded", function (event) {
      crawl(environment.document.body, CRAWLED_MARKER, genericFontDictionary, environment);
   });

   const style = createStyle(shwaFonts, CRAWLED_MARKER, environment);
   environment.document.documentElement.appendChild(style);
   
}

// Global browser calls encapsulated here
function getEnvironment() {
   var environment = { window: window, document: document };

   // Target a generic browser
   environment.window.browser = (function () {
      return window.msBrowser ||
         window.chrome ||
         browser;
   })();

   return environment;
}

function getShwaFonts() {
   return {
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
}

function getGenericFontDictionary() {
   // Keys cannot contain special RegExp characters
   return {
      "serif":      ["Times New Roman", "Georgia", "DejaVu Serif"],
      "sans-serif": ["Helvetica", "Arial"],
      "monospace":  ["Courier New", "Courier", "Ubuntu Monospace"],
      "cursive":    ["Apple Chancery", "URW Chancery L"],
      "fantasy":    ["Luminari", "Trattatello", "Papyrus"],
      "system-ui":  ["Helvetica", "Arial"]
   };
}

function createStyle(alphabet, CRAWLED_MARKER, environment) {
   var document = environment.document;
   var style = document.createElement('style');
   style.type = 'text/css';
   var css = createCss(alphabet, CRAWLED_MARKER, environment);
   style.appendChild(document.createTextNode(css));
   return style;
}

function createCss(alphabet, CRAWLED_MARKER, environment) {
   return `
   body :not(svg):not(.${CRAWLED_MARKER}) {
      color: transparent !important;
   }
   ${createFonts(alphabet, environment)}
   `;
}

function createFonts(alphabet, environment) {
   var resultString = '';
   alphabet.families.forEach(family => {
      family.names.forEach(name => {
         family.fonts.forEach(font => {
            resultString += (
               `
               @font-face {
                  font-family: '${name}';
                  src: url('${environment.window.browser.runtime.getURL('font/'+font.file)}');
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
   
function crawl(element, CRAWLED_MARKER, generic_font_dict, environment) {
   if (element.tagName.toUpperCase() == "SCRIPT") {
      return;
   }
   const originalText = element.textContent;
   var promises = [];
   element.childNodes.forEach(child => {
      if (child.firstChild) {
         setTimeout(() => crawl(child, CRAWLED_MARKER, generic_font_dict, environment));
      } else {
         promises.push(transcribeNode(child));
      }
   });
   if (element.classList) {
      const genericFontReplacements = generic_font_dict[environment.window
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
      