from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def hello_world():
    if request.method == 'POST':
        test_input = request.form.get('test-input')  # Gets the value of 'test-input' from the form
        print(f"{test_input}") 
    return render_template('simple.html')

if __name__ == '__main__':
    app.run()
