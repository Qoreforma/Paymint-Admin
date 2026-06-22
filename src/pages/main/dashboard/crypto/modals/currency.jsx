import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, Modal, ModalBody } from "reactstrap";
import { useUpdateCryptoCurrencies } from "../../../../../api/crypto";
import { Button, Col, Icon } from "../../../../../components/Component";

const CurrencyModal = ({ modal, closeModal, formData, setFormData }) => {
  const { mutate: editCurrency, isSuccess } = useUpdateCryptoCurrencies(formData.id);

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitForm = (e) => {
    const dataToSubmit = new FormData();
    dataToSubmit.append("exchange_rate_to_ngn", formData?.exchangeRate);
    dataToSubmit.append("buy_rate", formData?.buyRate);
    dataToSubmit.append("sell_rate", formData?.sellRate);
    dataToSubmit.append("_method", "PATCH");
    editCurrency(dataToSubmit);
  };

  const close = () => {
    closeModal();
  };

  useEffect(() => {
    if (isSuccess) {
      closeModal();
    }
  }, [isSuccess]);

  return (
    <Modal isOpen={modal} toggle={close} className="modal-dialog-centered" size="md">
      <ModalBody>
        <a
          href="#cancel"
          onClick={(ev) => {
            ev.preventDefault();
            close();
          }}
          className="close"
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">Edit {formData?.name}</h5>
          <div className="mt-4">
            <Form className="row gy-4" noValidate onSubmit={handleSubmit(submitForm)}>
              <Col md="12">
                <div className="form-group">
                  <label className="form-label">Exchange Rate to Naria</label>
                  <input
                    className="form-control"
                    type="tel"
                    value={formData?.exchangeRate}
                    onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                    placeholder="Enter Rate"
                  />
                  {errors.exchangeRate && <span className="invalid">{errors.exchangeRate.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Buy Rate</label>
                  <input
                    className="form-control"
                    type="tel"
                    value={formData?.buyRate}
                    onChange={(e) => setFormData({ ...formData, buyRate: e.target.value })}
                    placeholder="Enter Rate"
                  />
                  {errors.buyRate && <span className="invalid">{errors.buy.message}</span>}
                </div>
              </Col>
              <Col md="6">
                <div className="form-group">
                  <label className="form-label">Sell Rate</label>
                  <input
                    className="form-control"
                    type="tel"
                    value={formData?.sellRate}
                    onChange={(e) => setFormData({ ...formData, sellRate: e.target.value })}
                    placeholder="Enter Rate"
                  />
                  {errors.sellRate && <span className="invalid">{errors.sellRate.message}</span>}
                </div>
              </Col>

              <Col size="12">
                <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                  <li>
                    <Button color="primary" size="md" type="submit">
                      Update Currency
                    </Button>
                  </li>
                  <li>
                    <a
                      href="#cancel"
                      onClick={(ev) => {
                        ev.preventDefault();
                        close();
                      }}
                      className="link link-light"
                    >
                      Cancel
                    </a>
                  </li>
                </ul>
              </Col>
            </Form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default CurrencyModal;
