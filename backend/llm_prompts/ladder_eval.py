from nltk.corpus import words
import nltk
import sys
import json
import re

# Load the words corpus in lowercase for uniformity.
try:
    english_words = set(w.lower() for w in words.words())
except LookupError:
    nltk.download('words', quiet=True)
    english_words = set(w.lower() for w in words.words())

def one_letter_change(word1, word2):
    if len(word1) != len(word2):
        return set()
    diff = 0
    positions = set()
    for i, (l1, l2) in enumerate(zip(word1, word2)):
        if l1 != l2:
            diff += 1
            positions.add(i)
    # Return positions if exactly one letter differs; otherwise, return empty set.
    return positions if diff == 1 else set()

def ladder_eval(input_data):
    # If "set" is not provided, try to extract boundaries from question_text.
    if "set" not in input_data:
        question_text = input_data.get("question_text", "")
        correct_answer = input_data.get("correct_answer", "").strip().upper()
        # Relaxed regex: allow for zero or more spaces around the separator.
        match = re.search(r'([A-Z]{4})\s*(?:____|\?)\s*([A-Z]{4})', question_text)
        if not match:
            raise ValueError("Could not extract word ladder set from question_text")
        first_word = match.group(1).strip().upper()
        last_word = match.group(2).strip().upper()
        word_set = [first_word, correct_answer, last_word]
    else:
        word_set = input_data["set"]
    
    # Normalize words: trim and convert to uppercase.
    word_set = [w.strip().upper() for w in word_set]
    
    # Validate each word is found in the English words corpus.
    for word in word_set:
        # Compare using lower-case.
        if word.lower() not in english_words:
            raise ValueError(f"{word} is not a recognised English word.")
    
    # Validate that each adjacent pair of words differs by exactly one letter.
    for i in range(len(word_set) - 1):
        change_positions = one_letter_change(word_set[i], word_set[i + 1])
        if not change_positions:
            raise ValueError(f"Invalid transition: {word_set[i]} → {word_set[i + 1]}")
        # (Not enforcing unique changed positions across transitions)
    
    # Return a copy of the input with the normalized "set" added.
    output = input_data.copy()
    output["set"] = word_set
    return output

if __name__ == "__main__":
    try:
        input_path = sys.argv[1]
        with open(input_path, 'r') as f:
            input_data = json.load(f)

        result = ladder_eval(input_data)
        print(json.dumps(result))
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
