from promptflow.core import tool

# Easy: 3 letters, simple pattern
# Medium: 4 letters, simple pattern
# Difficult: 4 letters, hard pattern

@tool
def use_a_rule_examples():
    return [
        {
            "input": "Easy", 
            "output": "sag (sat) rut        but (?) fog"
        },
        {
            "input": "Easy",
            "output": "tap (pod) nod        son (?) rib"
        },
        {
            "input": "Medium",
            "output": "deal (ode) crop        spin (?) load"
        },
        {
            "input": "Difficult",
            "output": "poet (port) part     wept (?) stag"
        },
        {
            "input": "Difficult",
            "output": "rely (yell) tale     scum (?) mane"
        }
    ]