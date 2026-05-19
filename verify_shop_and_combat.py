from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Step 1: Login
        print("Logging in...")
        page.goto('http://127.0.0.1:8000/login')
        page.fill('input[id="email"]', 'test@xblaster.com')
        page.fill('input[id="password"]', 'password')
        page.get_by_role('button', name='Log in').click()
        page.wait_for_url('http://127.0.0.1:8000/garage')
        print("Logged in!")
        page.screenshot(path='playwright_garage.png')

        # Step 2: Go to Shop and Buy/Equip something if we can, or just verify shop loads
        print("Going to shop...")
        page.goto('http://127.0.0.1:8000/shop')
        page.wait_for_selector('text=Shop')
        print("In shop!")
        page.screenshot(path='playwright_shop.png')
        
        # Step 3: Go to Arena
        print("Entering Arena...")
        page.goto('http://127.0.0.1:8000/arena')
        page.wait_for_selector('canvas', timeout=15000)
        time.sleep(3) # Let scene boot up
        page.screenshot(path='playwright_arena_start.png')
        print("Arena Loaded!")

        # Step 4: Fire some lasers to see if they render
        print("Firing lasers...")
        page.mouse.move(960, 540) # move mouse to center
        page.mouse.down()
        time.sleep(0.5)
        page.mouse.up()
        time.sleep(0.5)
        page.screenshot(path='playwright_arena_firing.png')

        browser.close()

if __name__ == "__main__":
    run()
