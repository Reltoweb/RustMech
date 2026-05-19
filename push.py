import subprocess
import sys

def run_command(command):
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    print("STDOUT:", stdout.decode())
    print("STDERR:", stderr.decode())
    return process.returncode

run_command("git remote remove origin")
run_command("git remote add origin https://oauth2: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@github.com/Reltoweb/RustMech.git")
run_command("git push -u origin jules-4506003157156232245-67f027f4:main")
