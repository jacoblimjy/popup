import random

def jumble_word(word):
    word_list = list(word) 
    random.shuffle(word_list)
    return ''.join(word_list)