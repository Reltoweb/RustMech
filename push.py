import subprocess

def run_command(command):
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    print("STDOUT:", stdout.decode())
    print("STDERR:", stderr.decode())
    return process.returncode

run_command("git checkout -b jules-4506003157156232245-67f027f4")
run_command("git push -u origin jules-4506003157156232245-67f027f4")
