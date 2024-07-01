import os
import csv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import datetime
import requests
from PIL import Image
from PIL.ExifTags import TAGS
from selenium.common.exceptions import NoSuchElementException

def handle_sticky_notes(driver, job_id):
    try:
        # Click the sticky note image to open the popup
        sticky_note_image = driver.find_element(By.XPATH, '//img[@onclick and contains(@src,"yellowsticky-sm")]')
        sticky_note_image.click()

        # Switch to the new window
        WebDriverWait(driver, 10).until(EC.number_of_windows_to_be(2))
        windows = driver.window_handles
        driver.switch_to.window(windows[1])

        # Scrape data from the popup
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # Replace <br> tags with newline characters
        for br in soup.find_all("br"):
            br.replace_with("\n")

        text_elements = soup.find_all('p')

        # Directory and file setup
        parent_folder = 'Bare DQE Bot'
        job_folder = os.path.join(parent_folder, job_id)
        if not os.path.exists(job_folder):
            os.makedirs(job_folder)

        with open(os.path.join(job_folder, 'Notes.txt'), 'w', encoding='utf-8') as file:
            for element in text_elements:
                text = element.get_text()  # Get text with replaced <br> tags
                # Remove text starting with "Note –" and everything following it
                text = text.split('Note –')[0].strip()
                file.write(text + '\n\n')

        # Close the popup and switch back to the main window
        driver.close()
        driver.switch_to.window(windows[0])

    except NoSuchElementException:
        print("Yellow sticky note not found. Skipping...")

def data_processing(html_content, job_folder):
    soup = BeautifulSoup(html_content, 'html.parser')
    data_dict = {}

    # Find the specific <td> tag with bgcolor attribute
    target_td = soup.find('td', {'bgcolor': "#f5f5f5"})

    # Replace <br> tags with newline characters in the target <td> content
    for br in target_td.find_all("br"):
        br.replace_with("\n")

    # Get text from the modified soup object
    text_content = target_td.get_text(separator="\n")

    # Split the text into lines and process each line
    lines = text_content.split('\n')
    unwanted_keys = ["00", "Kindly note the following scenario to be followed"]
    for line in lines:
        if ':' in line:
            key, value = line.split(':', 1)  # Split only on the first colon
            key = key.strip()
            if key not in unwanted_keys:
                data_dict[key] = value.strip()

    # Export data to CSV in the job folder
    csv_file_path = os.path.join(job_folder, 'data_processed.csv')
    with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['Key', 'Value'])
        for key, value in data_dict.items():
            writer.writerow([key, value])

    return data_dict

def extract_report_data(driver):
    report_data = {}
    table = driver.find_element(By.CLASS_NAME, "admin-question-form")
    rows = table.find_elements(By.CSS_SELECTOR, "tr")
    for row in rows:
        if "Bare - Code of Conduct" in row.text:
            break  # Stop processing if "Bare - Code of Conduct" is found
        cells = row.find_elements(By.CSS_SELECTOR, "td")
        if not cells:
            continue
        question_cell = cells[0]
        question = question_cell.text.strip()  # Initialize question with the full text of the cell
        inputs = row.find_elements(By.CSS_SELECTOR, "input[type='text'], input[type='radio'], input[type='checkbox'], textarea, select")
        answers = []
        for input_elem in inputs:
            if input_elem.tag_name == 'textarea' or input_elem.get_attribute('type') == 'text':
                # Check if the parent TR does not have the specified background color and the input is empty
                if input_elem.get_attribute('value').strip() == '' and 'background-color: rgb(128, 128, 128);' not in input_elem.find_element(By.XPATH, './ancestor::tr').get_attribute('style'):
                    answers.append('Not Answered')
                else:
                    answers.append(input_elem.get_attribute('value').strip())
            elif input_elem.tag_name == 'select':
                answers.append(input_elem.find_element(By.CSS_SELECTOR, 'option:checked').text.strip())
            elif input_elem.get_attribute('type') == 'radio' or input_elem.get_attribute('type') == 'checkbox':
                if input_elem.is_selected():
                    # Using JavaScript to retrieve the next sibling node's text content
                    label = driver.execute_script(
                        "return arguments[0].nextSibling.textContent;", input_elem)
                    answers.append(label.strip())

        # Join answers with 'and' if more than one checkbox is selected
        answer = ' and '.join(filter(None, answers))
        if answer:  # Only add to dictionary if answer is not empty
            report_data[question] = answer
    return report_data

def download_images(driver, job_folder):
    # Get the page source and parse it with BeautifulSoup
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    
    # Find all <a> tags where href starts with the specified URL
    image_links = soup.find_all('a', href=lambda x: x and x.startswith('https://cdn.sassiex.com'))
    
    exif_date_time_found = False  # Flag to track if EXIF date and time is found
    
    for link in image_links:
        # Get the image URL
        image_url = link['href']
        
        # Extract the image name from the URL
        image_name = image_url.split('/')[-1] + '.jpg'
        
        # Download the image
        response = requests.get(image_url)
        if response.status_code == 200:
            with open(os.path.join(job_folder, image_name), 'wb') as f:
                f.write(response.content)
                
                # Check for EXIF data in the image
                try:
                    img = Image.open(os.path.join(job_folder, image_name))
                    exif_data = img._getexif()
                    if exif_data:
                        for tag, value in exif_data.items():
                            tag_name = TAGS.get(tag, tag)
                            if tag_name == 'DateTimeOriginal':
                                exif_date_time_found = True
                                print("EXIF Date and Time found in images")
                                break
                except Exception as e:
                    pass
    
    if not exif_date_time_found:
        print("No EXIF Date and Time in images")

def process_multiple_job_ids(job_ids):
    for job_id in job_ids:
        options = webdriver.ChromeOptions()
        options.add_argument('--ignore-ssl-errors=yes')
        options.add_argument('--ignore-certificate-errors')

        driver = webdriver.Chrome(options=options)

        driver.get("https://www.apollo.bareinternational.com/admin/LoginAdmin.norm.php?jumpdomain=168")
        driver.find_element(By.NAME, 'login').send_keys("GSingh")
        driver.find_element(By.NAME, 'password').send_keys("Henghyan00!")
        driver.find_element(By.ID, 'login-button').click()

        url = f"https://www.apollo.bareinternational.com/admin/ShopReview-Right.php?JobID={job_id}"
        driver.get(url)

        handle_sticky_notes(driver, job_id)

        # Extract report data
        report_data = extract_report_data(driver)

        # Save report data to CSV
        parent_folder = 'Bare DQE Bot'
        job_folder = os.path.join(parent_folder, job_id)
        if not os.path.exists(job_folder):
            os.makedirs(job_folder)
        csv_file_path = os.path.join(job_folder, 'ReportData.csv')
        with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Question', 'Answer'])
            for key, value in report_data.items():
                writer.writerow([key, value])

        # Process data and save to CSV
        html_content = driver.page_source
        data_dict = data_processing(html_content, job_folder)

        # Download images
        download_images(driver, job_folder)

        driver.quit()

        # Print today's date and additional information
        today_date = datetime.datetime.now().strftime("%Y-%m-%d")
        print(f"{today_date} ; GS ; First Tier ; Edited ; Incomplete")

# List of job IDs to process
job_ids = ['11696118','11696083','11685895','11690629']

# Process multiple job IDs
process_multiple_job_ids(job_ids)


