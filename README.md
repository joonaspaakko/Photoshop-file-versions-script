# Auto Save PSD script for Photoshop

Enables you to easily save potentially important milestones of your project as separate `.psd` files. 

![Example of saved psd files](readme_img/Example.jpg)

## Install

* **Download the files**: `Auto Save PSD.jsx` and `Auto Save PSD.atn`
* **Auto Save PSD.atn**: Double click this file so that it is added to photoshop.
  * You can make sure that it was added by going to: `Window > Actions` and making sure that you an find `Auto Save PSD` folder at the bottom of your Actions panel.
* **Auto Save PSD.jsx**: Put this file in `{Photoshop_root}\Presets\Scripts\Auto Save PSD.jsx`
  * Next time you open photoshop you will find the script in: `File > Scripts > Auto Save PSD...`
* **Add a shortcut in photoshop**: 
  * `Edit > Keyboard shortcuts...`
  * `Shortcuts for: [Applications menus]`
  * `File > Scripts > Auto Save PSD`  ![Keyboard shotcuts](readme_img/Shortcut.jpg)
  * **Install complete**

## Things you should know
* You might want to save new file by using the script, so that the very first save will also be saved separately.
* A document needs to be open for the script to do anything.
* The script will find the required Photoshop Action (`Auto Save PSD.atn`) automatically when needed, as long as you've added it into photoshop. 
