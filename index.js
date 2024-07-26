var day_seed;
var prng_seed;

var day_words = [];
var current_word_ix = 0;
var current_guess = [];
var current_score = 0;
var total_score = 0;

function prng() {
  prng_seed ^= prng_seed << 13;
  prng_seed ^= prng_seed >> 17;
  prng_seed ^= prng_seed << 5;

  return (prng_seed < 0) ? ~prng_seed+1 : prng_seed;
}

const binary_search_index = (arr, val) => {
  let start = 0;
  let end = arr.length - 1;

  while (start <= end) {
    let mid = Math.floor((start + end) / 2);

    if (arr[mid] === val) {
      return { found: true, index: mid };
    }

    if (val < arr[mid]) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return { found: false, index: start };
};

const update_score_bar = () => {
  window.document.getElementById("progress").innerText = `${current_word_ix + 1}/5`;
  window.document.getElementById("score").innerText = `${current_score}`;
  window.document.getElementById("total_score").innerText = `${total_score}`;
};

const update_row_view = (id, chars) => {
  const tiles = window.document.getElementById(id).getElementsByClassName("tile");
  
  for (i = 0; i < tiles.length; i++) {
    var tile = tiles.item(i)

    tile.textContent = (i < chars.length) ? chars[i] : "";
  }
};

const commit_guess = () => {
  const given = day_words[current_word_ix];
  const given_ix = binary_search_index(solutions, given).index;
  const guess = current_guess.join("");

  if (guess != given && candidates.has(guess)) {
    const search = binary_search_index(solutions, guess);
    const score = Math.abs(search.index - given_ix) + ((search.found) ? 0 : 1);

    current_score = score;
    total_score += score;
    update_score_bar();

    if (given_ix > 0) {
      update_row_view("before_given", solutions[given_ix - 1]);
      window.document.getElementById("before_given").style.visibility = "visible";
    }

    if (given_ix < solutions.length - 1) {
      update_row_view("after_given", solutions[given_ix + 1]);
      window.document.getElementById("after_given").style.visibility = "visible";
    }

    if (current_word_ix < 4) {
      window.document.getElementById("key_enter").style.visibility = "visible";
    }

    window.document.getElementById("score").style.visibility = "visible";
    window.document.querySelector(':root').style.setProperty('--guess-color', 'rgb(239, 156, 102)');

  } else {
    current_guess = [];
    update_row_view("guess", current_guess);
  }
};

const handle_key = (k) => {
  if (current_guess.length == 5) {
    if (current_word_ix == 4) {
      return;
    }

    current_word_ix += 1;
    current_score = 0;
    current_guess = [];

    update_row_view("given", day_words[current_word_ix]);
    window.document.getElementById("before_given").style.visibility = "hidden";
    window.document.getElementById("after_given").style.visibility = "hidden";
    window.document.getElementById("key_enter").style.visibility = "hidden";
    window.document.getElementById("score").style.visibility = "hidden";
    window.document.querySelector(':root').style.setProperty('--guess-color', 'lightgrey');
    update_row_view("guess", current_guess);
    update_score_bar();
    return;
  }

  if (k.length == 1 && k.match(/[a-z]/i)) {
    current_guess.push(k);
  } else if (k === "Backspace" || k === "Delete") {
    current_guess.pop();
  } else {
    return;
  }

  update_row_view("guess", current_guess);
  if (current_guess.length == 5) {
    commit_guess();
  }
};

window.onload = () => {
  const start_date = new Date("01/01/2024");
  day_seed = Math.ceil((Date.now() - start_date.getTime()) / (24 * 60 * 60 * 1000));
  prng_seed = (day_seed > 0) ? day_seed : 42;

  for (i = 0; i < 5; i++) {
    var word;

    do {
      var rand_ix = prng() % solutions.length;
      word = solutions[rand_ix];
    } while (day_words.includes(word));

    day_words.push(word);
  }

  console.log(`DAY ${day_seed}`);
  console.log(`words ${day_words}`);

  update_row_view("given", day_words[current_word_ix]);

  "abcdefghijklmnopqrstuvwxyz".split('').forEach((char) => {
    window.document.getElementById(`key_${char}`).addEventListener("click", () => {
      handle_key(char);
    });
  });

  window.document.getElementById("key_enter").addEventListener("click", () => {
    handle_key("Enter");
  });
  window.document.getElementById("key_del").addEventListener("click", () => {
    handle_key("Delete");
  });
};

window.addEventListener("keypress", (event) => {
  const k = event.key;
  handle_key(k);
});
