<?php
/**
 * Clase que devuelve la ruta al forward de _dispatch en base a la configuración a los parámetros de request
* @author jabi
*
*/
class KlearMatrix_Model_Field_Picker extends KlearMatrix_Model_Field_Abstract
{
    protected $_control;
    protected $_language = 'es';

    public function init()
    {
        parent::init();

        $sourceConfig = $this->_config->getRaw()->source;

        $controlClassName = "KlearMatrix_Model_Field_Picker_" . ucfirst($sourceConfig->control);

        $this->_control = new $controlClassName;

        $this->_control
            ->setConfig($sourceConfig)
            ->init();
    }

    public function getConfig()
    {
        return $this->_control->getConfig();
    }

    private function getFormat($phpFormat = true)
    {
        if ($phpFormat) {

            return $this->_control->getPhpFormat();
        }

        return $this->_control->getFormat();
    }

    /*
     * Filtra (y adecua) el valor del campo antes del setter
     *
     */
    public function filterValue($value,$original)
    {
        $value = new Zend_Date($value, $this->getFormat(true));
        return $value;
    }

    /*
     * Prepara el valor de un campo, después del getter
     */
    /**
     * @param mixed $value Valor devuelto por el getter del model
     * @param object $model Modelo cargado
     * @return unknown
     */
    public function prepareValue($value, $model)
    {
        $getter = $this->_column->getGetterName($model);
        $zendDateValue = $model->$getter(true);

        $format = $this->getFormat(true);

        if ($zendDateValue instanceof Zend_Date) {

            return $zendDateValue->toString($format);
        }

        return $value;
    }

    public function getExtraJavascript() 
    {
        if ($this->_control) {
            return $this->_control->getExtraJavascript();
        } else {
            return parent::getExtraJavascript();
        }
    }


    public function getExtraCss() 
    {
        if ($this->_control) {
            return $this->_control->getExtraCss();
        } else {
            return parent::getExtraCss();
        }
    }
}