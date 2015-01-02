ENV['VAGRANT_DEFAULT_PROVIDER'] = 'virtualbox'
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.provision :shell, path: "vagrant-provision.sh"
  config.vm.provision "shell", path: "vagrant-provision-always.sh",
    run: "always"

  config.vm.network "forwarded_port", guest: 8100, host: 8100
  config.vm.network "forwarded_port", guest: 8101, host: 8101
  config.vm.network "forwarded_port", guest: 8201, host: 8201
  config.vm.network "forwarded_port", guest: 8202, host: 8202
  config.vm.network "forwarded_port", guest: 35729, host: 35729

  config.vm.synced_folder ".", "/toc"
  config.vm.synced_folder "./cache", "/var/cache/toc"
  config.vm.synced_folder ".", "/vagrant", disabled: true

  config.vm.provider "virtualbox" do |v|
    v.memory = 1024
  end
end
