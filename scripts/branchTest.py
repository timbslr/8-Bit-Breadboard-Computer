# This script was written by ChatGPT

# -----------------------------
# 8-bit helpers
# -----------------------------

def u8(x):
    return x & 0xFF


def calc_flags(a, b):
    r = u8(a - b)

    # CF = NOT borrow (your ISA style)
    CF = 1 if a >= b else 0
    ZF = int(r == 0)

    # signed
    sa = (a >> 7) & 1
    sb = (b >> 7) & 1
    sr = (r >> 7) & 1
    VF = int((sa != sb) and (sa != sr))

    NF = int(sr)

    return CF, ZF, NF, VF


# -----------------------------
# branch semantics (MATCH ASM ORDER)
# -----------------------------

def eval_branches(a, b):
    CF, ZF, NF, VF = calc_flags(a, b)

    signed_lt = NF ^ VF
    signed_ge = 1 - signed_lt

    return [
        # 0 blt
        "t" if signed_lt else "f",

        # 1 bltu
        "t" if CF == 0 else "f",

        # 2 ble
        "t" if (signed_lt or ZF) else "f",

        # 3 bleu
        "t" if (CF == 0 or ZF) else "f",

        # 4 beq
        "t" if ZF else "f",

        # 5 bne
        "t" if not ZF else "f",

        # 6 bge
        "t" if signed_ge else "f",

        # 7 bgeu
        "t" if CF else "f",

        # 8 bgt
        "t" if (signed_ge and not ZF) else "f",

        # 9 bgtu
        "t" if (CF and not ZF) else "f",
    ]


# -----------------------------
# fixed test vectors (from ASM)
# -----------------------------

TEST_VECTORS = [
    (0x22, 0x22),
    (0x22, 0x11),
    (0x10, 0x20),
    (0x30, 0x10),
    (0x80, 0x01),
    (0x01, 0x80),
]


# -----------------------------
# input reader (STOP on blank or 6 lines)
# -----------------------------

def read_input(max_lines=6):
    import sys

    lines = []

    for line in sys.stdin:
        line = line.strip()

        # stop on blank line
        if line == "":
            break

        lines.append(line)

        # stop after 6 vectors
        if len(lines) == max_lines:
            break

    return lines


# -----------------------------
# validation
# -----------------------------

def validate(lines):
    errors = []

    for i, ((a, b), got) in enumerate(zip(TEST_VECTORS, lines)):
        expected = "".join(eval_branches(a, b))

        if got != expected:
            errors.append((i, a, b, expected, got))

    return errors


# -----------------------------
# main
# -----------------------------

if __name__ == "__main__":
    print("Enter up to 6 lines (10 chars each). Blank line to finish:\n")

    lines = read_input()

    if len(lines) != len(TEST_VECTORS):
        print(f"WARNING: expected {len(TEST_VECTORS)} lines, got {len(lines)}\n")

    errors = validate(lines)

    if not errors:
        print("OK")
    else:
        print("FAILURES:\n")
        for i, a, b, exp, got in errors:
            print(f"[{i}] A={a:02X} B={b:02X}")
            print(f" expected: {exp}")
            print(f" got     : {got}\n")