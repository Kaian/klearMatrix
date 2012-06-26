<?php
abstract class KlearMatrix_Model_AbstractOption
{
    protected $_config;
    protected $_class;
    protected $_title;
    protected $_default = false;
    protected $_noLabel = true;

    public function setConfig(Zend_Config $config)
    {
        $this->_config = new Klear_Model_KConfigParser;
        $this->_config->setConfig($config);

        $this->_title = $this->_config->getProperty("title");
        $this->_class = $this->_config->getProperty("class");
        $this->_label = (bool)$this->_config->getProperty("label");
        $this->_init();
    }

    protected function _init()
    {
        $this->_showOnlyOnNotNull = (bool)$this->_config->getProperty("optionShowOnlyOnNotNull");
        $this->_showOnlyOnNull = (bool)$this->_config->getProperty("optionShowOnlyOnNull");
    }

    // Solo aplicable para fieldOptionsWrapper
    public function setAsDefault()
    {
        $this->_default = true;
    }

    public function isDefault()
    {
        return true === $this->_default;
    }

    abstract public function toArray();
}