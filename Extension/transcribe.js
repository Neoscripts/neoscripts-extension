function transcribe(text) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(cyrusTranscribe(false, text)), 0);
  });
}

var cyrusAsk = "false";

function cyrusDisambiguate(r) {
   if (window.confirm("For the word \"" + r.toLowerCase() + "\", did you mean " + cmuShwaHets[r][1] + "? If so, click OK.\nBut if you mean " + cmuShwaHets[r][0] +
      ", then click Cancel."))
      return r + "_1";
   else 
      return r;
}

function cyrusTrans(r) {
   if (cyrusAsk && cmuShwaHets[r])
      r = cyrusDisambiguate(r);
   var s = cmuShwaDict[r];
   if (s)
      return s;
   return "";
}

function cyrusTranscribe(a, roman) {
   cyrusAsk = a; // set global value
   var r = roman;// + " "; // add final space
   r = r.replace(/\.(?=\d)/g, "\uE100").replace(/\,(?=\d)/g, "").replace(/\-(?=\d)/g, "\uE082"); // transcribe numeric punctuation
   r = r.replace(/0/g, "\uE0DC").replace(/1/g, "\uE084").replace(/2/g, "\uE0E4").replace(/3/g, "\uE094").replace(/4/g, "\uE0BC");
   r = r.replace(/5/g, "\uE0EC").replace(/6/g, "\uE08C").replace(/7/g, "\uE09C").replace(/8/g, "\uE0B4").replace(/9/g, "\uE0D4");
   r = r.replace(/\&/g, "and");
   r = r.replace(/\.\W/g, "\uE07A\uFF65").replace(/\? /g, "\uE075\uFF65").replace(/\! /g, "\uE07F\uFF65"); // transcribe sentence punctuation
   r = r.replace(/, /g, "\uE082\uFF65").replace(/[;:] /g, "\uE086\uFF65").replace(/ [\u2013\u2014] /g, "\uE086\uFF65"); // transcribe phrase punctuation
   r = r.replace(/[\(\[\{\<]/g, "\uE083").replace(/[\)\]\}\>]/g, "\uE081"); // transcribe brackets
   r = r.replace(/\u00AB/g, '\uE085').replace(/\u00BB/g, '\uE087'); // transcribe guillemets
   r = r.replace(/\u201C/g, '\uE085').replace(/\u201D/g, '\uE087'); // transcribe chiral double quotes
   while (r.search('"')!=-1) {
      r = r.replace('"', '\uE085');
      r = r.replace('"', '\uE087');
   } // transcribe neutral double quotes
   while (r.search('"')!=-1) {
      r = r.replace('\u2018', '\uE085');
      r = r.replace('\u2019', '\uE087');
   } // transcribe paired single quotes
   r = r.toUpperCase();
   r = r.replace(/['\u2018\u2019]/g, "_a"); // replace apostrophes or unpaired single quotes with _a
   r = r.replace(/\./g, "_d"); // replace internal dots with _d
   r = r.replace(/\-/g, "_h"); // replace hyphen with _h
   r = r.replace(/THE ([AEIOU])/g, "THE_2 $1"); // use "long the" before vowels
   r = r.replace(/ /g, "\uFF65"); // transcribe space
   var words = r.split(/\b/);
   var shwa = "";
   for (var w in words) {
      var s = cyrusTrans(words[w]);
      if (s=="") {
         s = words[w].replace("_d", ".").replace("_a", "'").replace("_h", "-");  // reverse substitutions with underscore
      }
      s = s.replace("", "\uE1F8").replace("", "\uE1F0").replace("", "\uE10F").replace("", "\uE0F8").replace("", "\uE0FC"); // replace old dark L, L, W, and short OO codepoints
      shwa += s.toLowerCase();
   }
   return shwa;
}
