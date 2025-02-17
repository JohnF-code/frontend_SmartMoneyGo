"use client";
import { useEffect, useState, Fragment, useContext } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { LoansContext } from "@component/contexts/LoansContext";
import Button from "@component/components/Button";

export default function ModalLoan({
  showLoan,
  setShowLoan,
  selectedLoan,
  setSelectedLoan,
}) {
  const { addLoan, updateLoan } = useContext(LoansContext);

  const [formData, setFormData] = useState({
    description: "",
    loanAmount: "",
    interest: "20",
    installments: "",
    date: "", // o lo que uses
  });

  useEffect(() => {
    if (selectedLoan) {
      setFormData({
        description: selectedLoan.description || "",
        loanAmount: String(selectedLoan.loanAmount || ""),
        interest: String(selectedLoan.interest || "20"),
        installments: String(selectedLoan.installments || ""),
        date: selectedLoan.date
          ? formatDateLocal(selectedLoan.date)
          : formatDateLocal(new Date()),
      });
    } else {
      setFormData({
        description: "",
        loanAmount: "",
        interest: "20",
        installments: "",
        date: formatDateLocal(new Date()),
      });
    }
  }, [selectedLoan]);

  function formatDateLocal(date) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  const handleClose = () => {
    setShowLoan(false);
    setSelectedLoan(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (selectedLoan && selectedLoan._id) {
      await updateLoan({
        ...formData,
        _id: selectedLoan._id,
        date: new Date(formData.date).toISOString(),
      });
    } else {
      await addLoan({
        ...formData,
        date: new Date(formData.date).toISOString(),
      });
    }
    handleClose();
  };

  if (!showLoan) return null;

  return (
    <Transition appear show={showLoan} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow max-w-md w-full p-4">
            <Dialog.Title className="text-xl font-bold mb-4">
              {selectedLoan ? "Editar Préstamo" : "Nuevo Préstamo"}
            </Dialog.Title>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1 text-sm">Descripción</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <label className="block mb-1 text-sm">Monto</label>
                  <input
                    type="number"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div className="flex-1">
                  <label className="block mb-1 text-sm">Interés (%)</label>
                  <input
                    type="number"
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <label className="block mb-1 text-sm">Cuotas</label>
                  <input
                    type="number"
                    name="installments"
                    value={formData.installments}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm">Fecha</label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={handleClose} type="button">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
