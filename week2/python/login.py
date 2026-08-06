#Task five
import time

credential = {
    "username": "admin",
    "password": "admin123"
}

def login ():
    attempts = 0
    times = 5
    sleep_time = [5, 10, 20, 40]
    
    while attempts < times:
        username = input("Enter username: ")
        password = input("Enter password: ")
        if username == credential["username"] and password == credential["password"]:
            return "Login successful!"
        else:
            attempts += 1
            if attempts < times:
                print(f"Invalid username or password. You have {times - attempts} attempts left.")
                print(f"Please wait {sleep_time[attempts-1]} seconds before trying again.")
                time.sleep(sleep_time * attempts)
                # print("sleep_time: ", sleep_time[attempts-1])
    return "Account Locked. Please try again later."

result = login()
print(result)