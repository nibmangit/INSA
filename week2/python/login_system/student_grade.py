from login import login

def find_grade(mark):
    if mark >= 80 and mark <= 100:
        return 'A'
    elif mark >= 70 and mark <= 79:
        return 'B'
    elif mark >= 60 and mark <= 69:
        return 'C'
    elif mark >= 50 and mark <= 59:
        return 'D'
    elif mark >= 0 and mark <= 49:
        return 'F'
    else: 
        return 'Invalid mark mark should be between 0 and 100'
 
def accept_student_info(name):
    # name = input("Enter the student's name: ")
    
    subjects = ["Math", "Science", "English"]
    marks =[]
    grades = {}
    for subject in subjects:
        mark = float(input(f"Enter marks for {subject}: "))
        
        while mark < 0 or mark > 100:
            print("Invalid mark. Please enter a value between 0 and 100.")
            mark = float(input(f"Enter marks for {subject}: "))
            
        marks.append(mark)
        grades[subject] = find_grade(mark)
    
    average = (sum(marks)/ len(marks))
    status = "Pass" if average >= 50 else "Fail"
    
    return {
        "name": name, 
        "grades": grades,
        "average": average,
        "status": status
    }

login_result = login()
print(login_result) 
if login_result["is_logged_in"] == True:
    student  = accept_student_info(login_result["name"])
    print("Your Information:" , student)
else:
    print("You are not logged in. Please try again later.")

    