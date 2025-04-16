import sys
import json

# Find the positions of letters in derived word from the base word
def get_letter_positions(base_word):
    char_positions = {}
    for idx, char in enumerate(base_word): # Fill dictionary with positions of each char in the base word
        if char not in char_positions:
            char_positions[char] = []
        char_positions[char].append(idx)
    return char_positions

def find_mapped_positions(base_word, derived_word):
    base_positions = get_letter_positions(base_word)
    mapped_positions = []
    for letter in derived_word:
        if letter in base_positions:
            mapped_positions.append(base_positions[letter])  # Store all possible positions
    return mapped_positions

def pair_eval(input):
    word_pairs = [(input["set"][0], input["set"][1]), (input["set"][2], input["set"][3]), (input["set"][4], input["set"][5])]

    # Check if the length of base word and derived word for each pair are the same
    first_lengths = {len(pair[0]) for pair in word_pairs}
    second_lengths = {len(pair[1]) for pair in word_pairs}
    consistent_first_length = len(first_lengths) == 1
    consistent_second_length = len(second_lengths) == 1
    if not (consistent_first_length and consistent_second_length):
        raise ValueError(f"Length of words are inconsistent.")

    mapped_positions_list = []
    for base, derived in word_pairs:
        mapped = find_mapped_positions(base, derived)
        mapped_positions_list.append(mapped)
        if len(mapped) != len(derived):  # Ensure all letters are mapped
            raise ValueError(f"Inconsistent letter mapping.")
    
    for i in range(len(mapped_positions_list[0])):  # Check if position for each pair is the same
        first_pos = mapped_positions_list[0][i]
        second_pos = mapped_positions_list[1][i]
        third_pos = mapped_positions_list[2][i]

        if any(pos in second_pos for pos in first_pos) and any(pos in third_pos for pos in first_pos) and any(pos in third_pos for pos in second_pos):
            continue
        else:
            raise ValueError(f"Letter positions are inconsistent across pairs at position {i + 1}.")
    
    output = input.copy()
    output.pop("set", None)
    return output

if __name__ == "__main__":
    try:
        input_path = sys.argv[1]
        with open(input_path, 'r') as f:
            input_data = json.load(f)

        result = pair_eval(input_data)
        print(json.dumps(result))  # Output to stdout for JS to parse

    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)