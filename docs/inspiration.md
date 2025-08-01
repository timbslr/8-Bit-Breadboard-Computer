---
title: Inspiration
layout: default
nav_order: 1
---

A few years ago, I already watched the [6502](https://www.youtube.com/watch?v=LnzuMJLZRdU&list=PLowKtXNTBypFbtuVMUVXNR0z1mu7dp7eH) and [8-Bit Breadboard Computer](https://www.youtube.com/watch?v=HyznrdDSSGM&list=PLowKtXNTBypGqImE405J2565dvjafglHU) projects from Bean Eater, which I found very fascinating. But at that time, I wasn't really able to fully understand what happens there, neither did I have the parts for building these projects. But as time goes by, I got access to more and more IC's, many of which are logic gates and other basic and useful IC's for such projects.

Although I now had access to most of the parts, I still didn't know how such an 8-Bit computer works, but that changed in summer 2025. In this semester at university we had the module "Rechnerorganisation" (in English: Computer Architecture), where we learned everything, as the name implies, about computer architecture from the ground up. We covered topics like:

- RISC-V as an example for a computer architecture
- the basics of assembler-language
- memory
- micro-architecture (comparing the single-cycle, multi-cycle and the pipeline processor)
- microinstructions

and so much more, which I don't want to go into detail here as it goes way beyond the scope of this project. Overall, it was an awesome lecture, in which I was able to gain much new knowledge in that area. In the end, I had a good understanding of how these computers operate and what the different micro-steps are to execute a single instruction.

With the new gained knowledge, I started my research what it takes to build an 8-Bit breadboard computer like the one from Ben Eater. I re-watched some of the old videos, searched the [Ben Eater subreddit](https://www.reddit.com/r/beneater/) for tips and tricks during building and found people improving upon Ben's design. In the end, I settled onto two key points:

- I will mostly copy the improved architecture from rolf-electronics's ["The 8-bit-SAP-3" project](https://github.com/rolf-electronics/The-8-bit-SAP-3), who did a great job documenting his SAP-3+ breadboard computer build (although I won't include advanced designs like interrupts for now, but I want the additional memory space for example (64K vs. the original 16 bits))
- I don't want to copy the exact wiring and chip positioning from Ben Eater by strictly following his videos, but rather try to implement my own circuits for the given architecture, and only if I don't know how to continue, search for solutions in Ben's videos or on the Ben Eater Subreddit.
