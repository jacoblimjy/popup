import random

# jumbles the correct word and fit it into the sentence
def jumble_word(word, distractors):
    word_list = list(word)
    while True:
        random.shuffle(word_list)
        jumbled = ''.join(word_list)
        if jumbled not in distractors and jumbled != word:
            return jumbled

# anagram evaluation - all options and jumbled are rearrangements of the correct answer
def validate_anagrams(jumbled, correct_word, distractor_words):
    all_words = [jumbled, correct_word] + distractor_words
    sorted_correct = sorted(correct_word)
    print(sorted_correct)

    for word in all_words:
        print(sorted(word))
        if sorted(word) != sorted_correct:
            raise ValueError(f"Invalid anagram found: {word} is not an anagram of {correct_word}")

# output json
def process_json(input):
    correct_answer = input["correct_answer"]
    capitalized = correct_answer.split(", ")[1].strip("()")
    correct_answer_letter = correct_answer.split(", ")[0].strip("()")
    distractors_word = []
    distractors_letter = []
    for option in input["distractors"]:
        letter = option.split(", ")[0].strip("()")
        word = option.split(", ")[1].strip("()")
        distractors_word.append(word)
        distractors_letter.append(letter)

    jumbled = jumble_word(capitalized, distractors_word)
    validate_anagrams(jumbled, capitalized, distractors_word) # evalute LLM output
    modified_sentence = input["question_text"].replace(capitalized, jumbled)

    options = input["distractors"] + [input["correct_answer"]]
    sorted_options = sorted(options, key=lambda x: x[1]) # sort by the first letter (A-E) in each tuple

    question_text = (
        f"TITLE: Anagram in a Sentence\n\n"
        "INSTRUCTIONS:\n"
        "Rearrange the letters in capitals to spell a word that completes "
        "the sentence in a sensible way.\n\n"
        f"{modified_sentence}\n\n"
        "Which of the following is the answer?\n"
        + "\n".join(sorted_options)
    )

    output = input.copy()
    output["question_text"] = question_text
    output["correct_answer"] = correct_answer_letter
    output["distractors"] = distractors_letter

    return output