function transcribe(text) {
    return new Promise(function(resolve, reject) {
      setTimeout(resolve, 0, text.split('')
                            .map(character => 
                                String.fromCodePoint(0xE1F8)
                                // character.toUpperCase()
                                )
                                .join(''));
    });
  }
  