!#/bin/sh
cd ~

#packages
echo "ParallelDownloads = 4" >> /etc/pacman.conf
sudo pacman -Sy git yay
git clone https://github.com/kiddae/colorer.git
git clone https://github.com/kiddae/dotfiles.git

sudo pacman -Sy polybar htop vim firefox bashtop alacritty --noconfirm

#code couleur
cd colorer
mkdir ~/.config/colorer/out
./colorer/__main__.py color_scheme_nord
# quelques erreurs pour les dossiers de logiciels qui ne sont pas installés, mais sinon on a bien le code couleur

#theme
cd ~/dotfiles
./switch_theme hermine/

#wallpaper
cd ~/affiches/
sudo pacman -Sy feh --noconfirm
feh --bg-fill ./wallpaper_nord.jpeg

#barre des taches
sudo pacman -Sy polybar --noconfirm
chmod +x ~/.config/polybar/launch.sh
# regarder https://github.com/polybar/polybar/wiki pour enlever la bar par défaut
echo "exec_always --no-startup-id $HOME/.config/polybar/launch.sh" > .i3/config

#shorcuts
cd ~/affiches/
echo shortcuts >> ~/.i3/config

#notes fond ecran studio ghibli wallpaper desktop 4k

#supression sur-impression sur le bureau
killall conky
