def letter_positions(front_word, middle_word, back_word):
    positions = {}
    for i, letter in enumerate(middle_word):
        if letter not in positions:
                positions[letter] = {'front': [], 'back': []}

        for j, f_letter in enumerate(front_word):
            if letter == f_letter:
                positions[letter]['front'].append(j)

        for k, b_letter in enumerate(back_word):
            if letter == b_letter:
                positions[letter]['back'].append(k)
    return positions

def position_match(solved_set, unsolved_set):
    front_word1, middle_word1, back_word1 = solved_set[0], solved_set[1], solved_set[2]
    front_word2, middle_word2, back_word2 = unsolved_set[0], unsolved_set[1], unsolved_set[2]
    pos1 = letter_positions(front_word1, middle_word1, back_word1)    
    pos2 = letter_positions(front_word2, middle_word2, back_word2)

    total_success = True

    for i in range(len(middle_word1)):
        letter1 = middle_word1[i]
        letter2 = middle_word2[i]
        pos1_letter = pos1.get(letter1, {'front': [], 'back': []})
        pos2_letter = pos2.get(letter2, {'front': [], 'back': []})
        matching_front = False
        matching_back = False

        if pos1_letter['front'] and pos2_letter['front']:
            matching_front = set(pos2_letter['front']).issubset(set(pos1_letter['front']))

        if pos1_letter['back'] and pos2_letter['back']:
            matching_back = set(pos2_letter['back']).issubset(set(pos1_letter['back']))

        if not (matching_front or matching_back):
            total_success = False
            break

    return total_success

def rule_eval(input):
    solved_set = input.get("solved_set")
    unsolved_set = input.get("unsolved_set")

    evaluation = position_match(solved_set, unsolved_set)

    output = input.copy()

    if not evaluation:
        raise ValueError("Evaluation failed: Solved and unsolved sets do not follow the same rule.")
    
    output.pop("solved_set", None)
    output.pop("unsolved_set", None)
    return output

    
