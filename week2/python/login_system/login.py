#Task five and modified for intefration with grade system
import time

credential = {
    "username": "admin",
    "password": "admin123"
}

def login ():
    attempts = 0
    times = 5
    sleep_time = [5, 10, 20, 40]
    print("Welcome to Login portal you have 5 attempts to loggin.")
    
    while attempts < times:
        username = input("Enter username: ")
        password = input("Enter password: ")
        if username == credential["username"] and password == credential["password"]:
            return {
                "message": "Login seccessfully",
                "name": username,
                "is_logged_in": True
            }
        else:
            attempts += 1
            if attempts < times:
                print(f"Invalid username or password. You have {times - attempts} attempts left.")
                print(f"Please wait {sleep_time[attempts-1]} seconds before trying again.")
                time.sleep(sleep_time * attempts)
                # print("sleep_time: ", sleep_time[attempts-1])
    return{
        "message":"Account Locked. Please try again later.",
        "is_logged_in":False
    }

# result = login()
# print(result)