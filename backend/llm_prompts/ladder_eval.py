def one_letter_change(word1, word2):
    if len(word1) != len(word2): # ensures all words are of equal length
        return False
    diff = 0
    for letter1, letter2 in zip(word1, word2):
        if letter1 != letter2:
            diff += 1
    return diff == 1

def ladder_eval(input):
    word_set = input.get("set")
    for i in range(len(word_set) - 1):
        if not one_letter_change(word_set[i], word_set[i + 1]):
            raise ValueError(f"Invalid transition: {word_set[i]} → {word_set[i + 1]}")
    
    output = input.copy()
    output.pop("set", None)
    return output