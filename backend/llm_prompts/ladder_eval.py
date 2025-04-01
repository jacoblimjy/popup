from nltk.corpus import words

english_words = set(words.words())

def one_letter_change(word1, word2):
    if len(word1) != len(word2): # ensures all words are of equal length
        return set()
    diff = 0
    position = set()
    for i, (letter1, letter2) in enumerate(zip(word1, word2)):
        if letter1 != letter2:
            diff += 1
            position.add(i)
    return position if len(position) == 1 else set()

def ladder_eval(input):
    word_set = input.get("set")

    # Check if every word in the set is a real English word.
    for word in word_set:
        if word.lower() not in english_words:
            raise ValueError(f"{word} is not a recognised English word.")
        
    available_positions = set(range(len(word_set[0])))

    for i in range(len(word_set) - 1):
        change_positions = one_letter_change(word_set[i], word_set[i + 1])
        
        if not change_positions:
            raise ValueError(f"Invalid transition: {word_set[i]} → {word_set[i + 1]}")
        
        if not change_positions.issubset(available_positions):
            raise ValueError(f"Repeated letter change at index {list(change_positions)}: {word_set[i]} → {word_set[i + 1]}")
        
        available_positions -= change_positions

    output = input.copy()
    output.pop("set", None)
    return output