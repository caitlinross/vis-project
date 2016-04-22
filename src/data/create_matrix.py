import random

f = open("matrix.csv", "w")
num_gvt = 50
num_lps = 12*16
gvt = 0;

for i in range(num_gvt+1):
    for j in range(num_lps):
        if i == 0:
            if j == 0:
                f.write("gvt,")
            f.write("lp_" + str(j))
        else:
            if j == 0:
                f.write(str(gvt) + ",")
                gvt += 100;
            f.write(str(random.randint(50, 200)))
        if j == num_lps-1:
            f.write("\n")
        else:
            f.write(",")
