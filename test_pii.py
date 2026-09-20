from app.tools.pii_tools import redact_pii


text = """
My name is Rohith Kumar.
My email is rohith@gmail.com.
My phone number is 9876543210.
"""


result = redact_pii(text)

print("Original:")
print(text)

print("\nRedacted:")
print(result)