var solutions = small_set;

var day_seed;
var prng_seed;
var day_word_ix;

const num_guesses = 5;

var word_scores = [];
var current_guess = [];

function prng() {
  prng_seed ^= prng_seed << 13;
  prng_seed ^= prng_seed >> 17;
  prng_seed ^= prng_seed << 5;

  return (prng_seed < 0) ? ~prng_seed + 1 : prng_seed;
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

const clear_rows = () => {
  const rows = window.document.getElementById("rows");
  rows.innerHTML = "";
};

const push_row = ({ chars, score }) => {
  const row = window.document.createElement("div");
  row.classList.add("row");

  const tile = window.document.createElement("div");
  tile.classList.add("tile");

  if (score == 0) {
    tile.style.borderColor = "var(--color0)";
  } else if (score <= 3) {
    tile.style.borderColor = "var(--color1)";
  } else if (score <= 10) {
    tile.style.borderColor = "var(--color2)";
  } else {
    tile.style.borderColor = "var(--color3)";
  }

  for (i = 0; i < 5; i++) {
    const t = tile.cloneNode();
    t.textContent = (i < chars.length) ? chars[i] : "";
    row.appendChild(t);
  }

  const word_score = window.document.createElement("p");
  word_score.classList.add("word_score");
  word_score.innerHTML = score.toString();
  row.appendChild(word_score);

  const rows = window.document.getElementById("rows");
  rows.appendChild(row);
};

const update_guess_view = () => {
  const guess = window.document.getElementById("guess");
  const tiles = guess.getElementsByClassName("tile");

  for (i = 0; i < tiles.length; i++) {
    var tile = tiles.item(i)

    tile.textContent = (i < current_guess.length) ? current_guess[i] : "";
  }

  const progress = window.document.getElementById("progress");
  progress.textContent = `${word_scores.length}/${num_guesses}`
};

const render_all = () => {
  clear_rows();
  word_scores.forEach(push_row);

  if (word_scores.length <= num_guesses) {
    update_guess_view();
  } else {
    window.document.getElementById("user_input").style.visibility = "hidden";

    const total_div = window.document.getElementById("total");
    total_div.style.visibility = "visible";

    var sum = 0;
    word_scores.forEach(({ score }) => {
      sum += score;
    });

    const total_score = window.document.getElementById("total_score");
    total_score.textContent = sum.toString();

    var shareText = `I got ${sum} in LexiGuess (day ${day_seed})!\n`;
    word_scores.forEach(({ score }) => {
      if (score == 0) {
        shareText += "⬜";
      } else if (score <= 3) {
        shareText += "🟩";
      } else if (score <= 10) {
        shareText += "🟨";
      } else {
        shareText += "🟧";
      }
      shareText += `${score}\n`;
    });

    shareText += "https://lexiguess.basilehenry.com";

    const shareData = {
      text: shareText,
    };

    if ((navigator.canShare && navigator.canShare(shareData)) || navigator.clipboard) {
      const share_btn = window.document.createElement("button");
      share_btn.classList.add("key");
      share_btn.innerText = "Share";
      share_btn.onclick = () => {
        if (navigator.canShare && navigator.canShare(shareData)) {
          navigator.share(shareData);
        } else {
          navigator.clipboard.writeText(shareText);
          share_btn.innerText = "Share (copied)";
        }
      };

      const share_btn_row = window.document.createElement("div");
      share_btn_row.classList.add("keyboard");
      share_btn_row.appendChild(share_btn);

      total_div.appendChild(share_btn_row);
    }
  }
};

const commit_guess = () => {
  const guess = current_guess.join("");

  const search = binary_search_index(solutions, guess);
  var allowed = search.found;

  word_scores.forEach(({ word }) => {
    if (guess === word) {
      allowed = false;
    }
  });

  if (allowed) {
    const search = binary_search_index(solutions, guess);
    const rel = search.index - day_word_ix;
    const score = Math.abs(rel);

    const word_entry = {
      word: guess,
      chars: guess.split(""),
      score: score,
      rel: rel,
    };

    var inserted = false;
    for (i = 0; i < word_scores.length; i++) {
      if (rel < word_scores[i].rel) {
        word_scores.splice(i, 0, word_entry);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      word_scores.push(word_entry);
    }

    // Reset current guess
    current_guess = [];
  }

  render_all();
};

const handle_key = (k) => {
  if (current_guess.length < 5 && k.length == 1 && k.match(/[a-z]/i)) {
    current_guess.push(k);
  } else if (k === "Backspace" || k === "Delete") {
    current_guess.pop();
  } else if (k === "Enter" && current_guess.length == 5) {
    commit_guess();

    if (current_guess.length == 5) {
      const guess_row = window.document.getElementById("guess");
      guess_row.classList.add("wrong");

      window.setTimeout(() => {
        guess_row.classList.remove("wrong");
      }, 600);
    }
  } else {
    return;
  }

  update_guess_view();
};

window.onload = () => {
  const start_date = new Date("01/01/2024");
  day_seed = Math.ceil((Date.now() - start_date.getTime()) / (24 * 60 * 60 * 1000));
  prng_seed = 0xC0FFEE + day_seed;

  const params = new URLSearchParams(window.location.search);
  if (params.get("big_set") == "1") {
    solutions = big_set;
    console.log("Using big set of words");
  }

  day_word_ix = prng() % solutions.length;
  day_word = solutions[day_word_ix];

  console.log(`day: ${day_seed}`);
  console.log(`day_word_ix: ${day_word_ix}`);
  console.log(`day_word: ${day_word}`);

  word_scores.push({
    word: day_word,
    chars: day_word.split(""),
    score: 0,
    rel: 0,
  });

  render_all();

  "abcdefghijklmnopqrstuvwxyz".split('').forEach((char) => {
    window.document.getElementById(`key_${char}`).addEventListener("click", () => {
      handle_key(char);
    });
  });

  window.document.getElementById("key_del").addEventListener("click", () => {
    handle_key("Delete");
  });

  window.document.getElementById("key_enter").addEventListener("click", () => {
    handle_key("Enter");
  });
};

window.addEventListener("keydown", (event) => {
  const k = event.key;
  handle_key(k);
});
