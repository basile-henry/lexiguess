var hard_mode;
var word_comparison;
const word_set = new Set(words);

var saved_game_key;
var day;
var day_word_ix;

const num_guesses = 5;

var word_scores = [];
var current_guess = [];

const reverse_string = (str) => {
  return str.split('').reverse().join('');
}

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

    var shareText = `I got ${sum} in LexiGuess (day ${day})!\n`;
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

  var allowed = word_set.has(guess);

  word_scores.forEach(({ word }) => {
    if (guess === word) {
      allowed = false;
    }
  });

  if (allowed) {
    const ix = words.findIndex((x) => x == guess);
    const rel = ix - day_word_ix;
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

    window.localStorage.setItem(saved_game_key, JSON.stringify(word_scores));
  }

  render_all();
};

const handle_key = (k) => {
  if (current_guess.length < 5 && k.length == 1 && k.match(/[a-z]/i)) {
    current_guess.push(k.toLowerCase());
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
  const day = Math.ceil((Date.now() - start_date.getTime()) / (24 * 60 * 60 * 1000));

  const params = new URLSearchParams(window.location.search);
  hard_mode = params.get("hard_mode") == "1";

  day_word_ix = day % words.length;
  day_word = words[day_word_ix];

  const mode_link = document.getElementById("mode");
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);

  if (hard_mode) {
    mode_link.textContent = "Back to normal mode";
    url.searchParams.set("hard_mode", "0");
    mode_link.href = url;

    word_comparison = (a, b) => {
      const revA = reverse_string(a);
      const revB = reverse_string(b);
      return revA.localeCompare(revB);
    };
  } else {
    mode_link.textContent = "Try hard mode 😈";
    url.searchParams.set("hard_mode", "1");
    mode_link.href = url;

    word_comparison = (a, b) => {
      return a.localeCompare(b);
    };
  }

  words.sort(word_comparison);
  day_word_ix = words.findIndex((x) => x === day_word);

  console.log(`day: ${day}`);
  console.log(`day_word: ${day_word}`);
  console.log(`hard_mode: ${hard_mode}`);

  word_scores.push({
    word: day_word,
    chars: day_word.split(""),
    score: 0,
    rel: 0,
  });

  saved_game_key = hard_mode ? `${day}_hard_mode` : `${day}_normal_mode`;
  console.log(`localStorage key: ${saved_game_key}`);
  const saved = window.localStorage.getItem(saved_game_key);

  if (saved != null) {
    word_scores = JSON.parse(saved);
  }

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
