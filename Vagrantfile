# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  
  # V2
  config.vm.box = "precise64_railsdev"
  config.vm.hostname = "RailsDevBox"
  config.vm.network "forwarded_port", guest: 3000, host: 3030
  config.vm.network "private_network", ip: "33.33.13.37"
  config.vm.synced_folder "../", "/railsprojects"
  
end
