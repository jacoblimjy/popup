import re
import json
import sys
import nltk

# Load the words corpus in lowercase for uniformity.
try:
    from nltk.corpus import words as nltk_words
    english_words = set(w.lower() for w in nltk_words.words())
except LookupError:
    nltk.download('words', quiet=True)
    english_words = set(w.lower() for w in nltk_words.words())

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

def clean_word(word):
    return re.sub(r'[^A-Za-z]', '', word)

def ladder_eval(input_data):
    # If "set" is not provided, try to extract boundaries from question_text.
    if "set" not in input_data:
        question_text = input_data.get("question_text", "")
        correct_answer = input_data.get("correct_answer", "").strip().upper()

        # First, try to match a two-blank pattern: e.g. "WORD ____ ____ WORD"
        two_blank_pattern = r'([A-Z]{4})\s*(?:____|\?)\s*(?:____|\?)\s*([A-Z]{4})'
        match2 = re.search(two_blank_pattern, question_text)
        if match2:
            first_word = match2.group(1).strip().upper()
            last_word = match2.group(2).strip().upper()
            parts = correct_answer.split()
            if len(parts) != 2:
                raise ValueError("For two blanks, correct_answer must consist of two words separated by a space.")
            # Create a set with four elements
            word_set = [first_word, parts[0], parts[1], last_word]
        else:
            # Fall back: try to match a one-blank pattern: e.g. "WORD ____ WORD"
            one_blank_pattern = r'([A-Z]{4})\s*(?:____|\?)\s*([A-Z]{4})'
            match1 = re.search(one_blank_pattern, question_text)
            if not match1:
                raise ValueError("Could not extract word ladder set from question_text")
            first_word = match1.group(1).strip().upper()
            last_word = match1.group(2).strip().upper()
            word_set = [first_word, correct_answer, last_word]
    else:
        word_set = input_data["set"]

    # Normalize the words by cleaning punctuation, trimming, and converting to uppercase.
    word_set = [clean_word(w).strip().upper() for w in word_set]

    # Validate each word is found in the English words corpus.
    for word in word_set:
        if word.lower() not in english_words:
            raise ValueError(f"{word} is not a recognised English word.")

    # Validate that each adjacent pair of words differs by exactly one letter.
    for i in range(len(word_set) - 1):
        change_positions = one_letter_change(word_set[i], word_set[i + 1])
        if not change_positions:
            raise ValueError(f"Invalid transition: {word_set[i]} → {word_set[i + 1]}")

    # Return a copy of the input with the normalized "set" added.
    output = input_data.copy()
    output["set"] = word_set
    return output

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            input_path = sys.argv[1]
            with open(input_path, 'r') as f:
                input_str = f.read()
        else:
            raise Exception("No input file argument provided.")
        input_data = json.loads(input_str)
    except Exception as e:
        print(f"Error reading input JSON: {e}")
        sys.exit(1)
    
    try:
        result = ladder_eval(input_data)
        print(json.dumps(result, indent=2))
    except Exception as err:
        print(f"Error processing input: {err}")
        sys.exit(1)
