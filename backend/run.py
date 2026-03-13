from app import create_app

app = create_app()

if __name__ == '__main__':
    print("=" * 50)
    print("STARTING FLASK SERVER")
    print(f"Server will run on: http://10.234.144.150:5000")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
