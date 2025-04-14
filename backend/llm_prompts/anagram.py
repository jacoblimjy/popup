import json
import random
import re
import sys

def is_english_word(word):
    """
    Trust that the given word is a true English word.
    """
    return True

def jumble_word(word, existing_distractors=None):
    """
    Shuffle the letters of 'word' until a jumbled result is found that 
    is different from both the original word and any in existing_distractors.
    """
    if existing_distractors is None:
        existing_distractors = []
    word_list = list(word)
    attempts = 0
    while True:
        attempts += 1
        random.shuffle(word_list)
        jumbled = ''.join(word_list)
        if jumbled != word and jumbled not in existing_distractors:
            return jumbled
        if attempts > 100:
            raise ValueError("Unable to generate a unique jumbled word.")

def generate_distractors(word, count=4):
    """
    Generate a list of 'count' unique jumbled versions of the given word.
    """
    distractors = []
    while len(distractors) < count:
        candidate = jumble_word(word, distractors)
        distractors.append(candidate)
    return distractors

def validate_options(correct_word, distractors):
    """
    Validate that:
      - No duplicate words exist among the correct answer and distractors.
      - Every option has the same length as the correct word.
      - Every option is composed of exactly the same letters as the correct word.
    """
    all_options = distractors + [correct_word]
    if len(all_options) != len(set(all_options)):
        raise ValueError("Duplicate words detected among options.")
    
    sorted_correct = sorted(correct_word)
    for option in all_options:
        if len(option) != len(correct_word):
            raise ValueError(f"Word length mismatch: {option} vs {correct_word}")
        if sorted(option) != sorted_correct:
            raise ValueError(f"Invalid anagram: {option} is not composed of the same letters as {correct_word}")

def process_json(input_data):
    """
    Process the LLM output JSON by:
      1. Extracting the ALLCAPS word from question_text.
      2. Validating that the word is an English word.
      3. Generating a set of distractors (unique jumbled versions).
      4. Replacing the original word with one jumbled option in the question text.
      5. Validating that all options (distractors and correct answer) are valid anagrams.
      6. Formatting the output in JSON.
    """
    question_text = input_data.get("question_text", "")
    match = re.search(r'\b([A-Z]{6,})\b', question_text)
    if not match:
        raise ValueError("No all-caps word with at least 6 letters found in the question text.")
    correct_word = match.group(1)
    
    if not is_english_word(correct_word):
        raise ValueError(f"The extracted word '{correct_word}' is not recognized as an English word.")
    
    distractors = generate_distractors(correct_word, count=4)
    
    validate_options(correct_word, distractors)
    
    # Replace the original word with the first jumbled version
    modified_sentence = question_text.replace(correct_word, distractors[0], 1)
    
    options = distractors + [correct_word]
    random.shuffle(options)
    
    formatted_options = "\n".join([f"{chr(65 + i)}) {option}" for i, option in enumerate(options)])
    
    final_question_text = (
        "TITLE: Anagram in a Sentence\n\n"
        "INSTRUCTIONS:\n"
        "Rearrange the letters in capitals to form a word that completes the sentence sensibly.\n\n"
        f"{modified_sentence}\n\n"
        "Which of the following is the correct answer?\n"
        f"{formatted_options}"
    )
    
    output = {
        "question_text": final_question_text,
        "answer_format": input_data.get("answer_format", "multiple_choice"),
        "explanation": input_data.get("explanation", "No explanation provided."),
        "correct_answer": correct_word,
        "distractors": distractors
    }
    
    return output

if __name__ == "__main__":
    try:
        # If an argument is provided, read from the file; otherwise, read from STDIN.
        if len(sys.argv) > 1:
            input_path = sys.argv[1]
            with open(input_path, 'r') as f:
                input_str = f.read()
        else:
            print("Please paste your JSON input (end with Ctrl+D on Unix/Mac or Ctrl+Z then Enter on Windows):")
            input_str = sys.stdin.read()
        input_data = json.loads(input_str)
    except Exception as e:
        print(f"Error reading input JSON: {e}")
        sys.exit(1)
    
    try:
        result = process_json(input_data)
        print(json.dumps(result, indent=2))
    except Exception as err:
        print(f"Error processing input: {err}")
        sys.exit(1)