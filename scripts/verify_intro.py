from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 1. 访问首页
        print("Navigating to http://localhost:3000...")
        page.goto('http://localhost:3000')
        
        # 2. 等待加载
        page.wait_for_load_state('networkidle')
        print("Page loaded.")
        
        # 3. 检查初始状态
        # 检查是否看到 "点击开启" 文字
        click_hint = page.locator('text=点击开启')
        if click_hint.is_visible():
            print("SUCCESS: Click hint is visible initially.")
        else:
            print("FAILURE: Click hint is NOT visible initially.")
            
        # 检查是否看到 HNU 火漆印
        seal = page.locator('button:has-text("HNU")')
        if seal.is_visible():
            print("SUCCESS: Wax seal is visible initially.")
        else:
            print("FAILURE: Wax seal is NOT visible initially.")
            
        # 4. 截图初始状态
        page.screenshot(path='c:\\Documents\\Galgame群活动\\与她的海大时光笺\\web\\debug_initial.png')
        print("Screenshot saved to debug_initial.png")
        
        # 5. 执行点击开启
        print("Clicking the wax seal...")
        # 元素有持续动画，需要强制点击
        seal.click(force=True)
        
        # 6. 等待动画开始 (给一点时间让 React 状态更新和动画启动)
        time.sleep(1) 
        
        # 7. 检查状态变化
        # 检查 "点击开启" 是否消失 (opacity 0)
        # 注意: is_visible() 会检查 opacity > 0, display != none, visibility != hidden
        if not click_hint.is_visible():
             print("SUCCESS: Click hint disappeared after click.")
        else:
             # 如果动画还在进行中，可能 opacity 不完全是 0，或者 Playwright 认为它还可见
             # 让我们检查一下 computed style
             opacity = click_hint.evaluate("el => getComputedStyle(el).opacity")
             print(f"INFO: Click hint opacity is {opacity}")
             if float(opacity) < 0.1:
                 print("SUCCESS: Click hint opacity is near 0.")
             else:
                 print("FAILURE: Click hint is still visible.")

        # 检查火漆印是否消失
        if not seal.is_visible():
            print("SUCCESS: Wax seal disappeared after click.")
        else:
             opacity = seal.evaluate("el => getComputedStyle(el).opacity")
             print(f"INFO: Wax seal opacity is {opacity}")
             if float(opacity) < 0.1:
                 print("SUCCESS: Wax seal opacity is near 0.")
             else:
                 print("FAILURE: Wax seal is still visible.")
                 
        # 8. 等待整个开场动画结束 (约 2-3 秒)
        print("Waiting for intro animation to finish...")
        time.sleep(3)
        
        # 9. 检查是否进入主界面 (检查是否有 DesktopExperience 或 MobileExperience 的特征)
        # 假设主界面有 "Desktop View" 或 "Mobile View" 文本 (占位组件里写的)
        # 或者是 "Interactive Map" (Mock 数据)
        content = page.content()
        if "Desktop View" in content or "Mobile View" in content:
            print("SUCCESS: Entered main experience.")
        else:
            print("WARNING: Could not detect 'Desktop View' or 'Mobile View' text. Dumping content snippet:")
            print(content[:500])
            
        page.screenshot(path='c:\\Documents\\Galgame群活动\\与她的海大时光笺\\web\\debug_final.png')
        print("Screenshot saved to debug_final.png")
        
        browser.close()

if __name__ == "__main__":
    run()
