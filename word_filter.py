import inflect
import json

p = inflect.engine()

with open("all_5_letter_words.json", "r") as f:
    all_words = json.load(f)

skipped = 0
words = []

for word in all_words:
    # Get rid of "simple" plurals
    if word[-1] == 's' and p.singular_noun(word) != False:
        skipped += 1
        continue

    words.append(word)

print(f"Skipped words: {skipped}")
print(f"Selected words: {len(words)}")

with open("words.json", "w") as f:
    json.dump(words, f)
