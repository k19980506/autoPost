# pip install selenium

from urllib.parse import quote
from selenium import webdriver
import time
import urllib
import os

path = input("請輸入你要存放照片的資料夾名稱: ")

query = input("請輸入你要搜索的關鍵字: ")

url = f"https://pic.sogou.com/pics?query={quote(query)}"

xpath = '//div[@class="figure-result"]/ul/li/div/a/img'

driver = webdriver.Chrome()

# 最大化窗口，因為每一次爬取只能看到視窗内的圖片
driver.maximize_window()

# 紀錄下載過的圖片網址，避免重複下載
img_url_dic = {}

# 瀏覽器打開爬取頁面
driver.get(url)

# 模擬滾動視窗瀏覽更多圖片
pos = 0
m = 0  # 圖片編號
for i in range(100):
    pos += i * 500  # 每次下滾500
    js = "document.documentElement.scrollTop=%d" % pos
    driver.execute_script(js)
    time.sleep(1)

    for element in driver.find_elements("xpath", xpath):
        try:
            img_url = element.get_attribute("src")

            # 保存圖片到指定路徑
            if img_url != None and not img_url in img_url_dic:
                img_url_dic[img_url] = ""
                m += 1
                ext = img_url.split("/")[-1]
                filename = "facebook_" + str(m) + ".jpg"
                print(filename)

                # 保存圖片
                urllib.request.urlretrieve(img_url, os.path.join(path, filename))

        except OSError:
            print("發生OSError!")
            print(pos)
            break

driver.close()
