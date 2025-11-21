from requests import get
from time import perf_counter

def speed_test():
    url="https://drive.google.com/u/0/uc?id=1whKELmLIoyGEYDT0c1DCn4VTMiPUuxUH&export=download"
    #url="https://drive.google.com/file/d/1whKELmLIoyGEYDT0c1DCn4VTMiPUuxUH/view?usp=share_link"
    start=perf_counter()
    r=get(url, stream=True)
    c=r.content
    t=perf_counter()-start
    b=len(c)
    return (b*8)/t

print(f"The download speed is {round(speed_test()/1_000_000,2)}Mbs")
