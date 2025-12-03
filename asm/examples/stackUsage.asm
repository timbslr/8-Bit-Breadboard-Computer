#include "./rules.asm"

li TMP, 10
push TMP
li TMP, 20
push TMP
li TMP, 30
push TMP
li TMP, 40
push TMP
li TMP, 50
push TMP
li TMP, 60
push TMP
li TMP, 70
push TMP
li TMP, 80
push TMP
li TMP, 90
push TMP
li TMP, 100
push TMP
out7sdi -1
pop A
out7sd A
pop A
out7sd A
pop A
out7sd A
pop A
out7sd A
pop A
out7sd A
pop A
out7sd A
pop A
out7sd A
pop A
out7sd A
pop A
out7sd A
pop A
out7sd A

hlt
