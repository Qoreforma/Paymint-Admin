import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Badge } from "reactstrap";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "../../../../components/Component";

const SortableBannerRow = ({ item, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border rounded p-3 mb-2 d-flex align-items-center justify-content-between"
    >
      {children}
    </div>
  );
};

const ReorderBanners = ({ modal, closeModal, banners = [], saveOrder }) => {
  const [items, setItems] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Setup sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  useEffect(() => {
    if (banners && banners.length > 0) {
      setItems(banners);
    }
  }, [banners]);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) {
      return;
    }

    setItems((currentItems) => {
      const oldIndex = currentItems.findIndex((i) => i._id === active.id);
      const newIndex = currentItems.findIndex((i) => i._id === over.id);

      if (oldIndex === -1 || newIndex === -1) return currentItems;

      const newArray = arrayMove(currentItems, oldIndex, newIndex);
      setHasChanges(true);
      return newArray;
    });
  };

  const handleSave = () => {
    if (saveOrder) {
      saveOrder(items);
    }
  };

  const handleCancel = () => {
    // Reset to original order
    setItems(banners);
    setHasChanges(false);
    closeModal();
  };

  if (!items || items.length === 0) {
    return (
      <Modal isOpen={modal} toggle={closeModal} centered size="lg">
        <ModalHeader toggle={closeModal}>Reorder Banners</ModalHeader>
        <ModalBody>
          <div className="text-center py-4">
            <p className="text-muted">No banners available to reorder</p>
          </div>
          <ModalFooter>
            <Button color="secondary" onClick={closeModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    );
  }

  return (
    <Modal isOpen={modal} toggle={handleCancel} centered size="lg">
      <ModalHeader toggle={handleCancel}>Reorder Banners</ModalHeader>

      <ModalBody>
        <div className="mb-3">
          <p className="text-muted">
            Drag and drop the banners to reorder them. Click and hold the handle icon to drag.
          </p>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
          <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableBannerRow key={item._id} item={item}>
                <div className="d-flex align-items-center w-100">
                  <Icon name="menu" className="me-3 text-muted" style={{ fontSize: "20px" }} />

                  <img
                    src={item.featuredImageUrl}
                    alt="Banner"
                    style={{
                      width: "70px",
                      height: "70px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />

                  <span className="ms-3 text-truncate" style={{ maxWidth: "300px" }}>
                    {item.link || "No link provided"}
                  </span>

                  <span className="ms-auto">
                    <Badge color={item.isActive ? "success" : "secondary"}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </span>
                </div>
              </SortableBannerRow>
            ))}
          </SortableContext>
        </DndContext>

        {hasChanges && (
          <div className="mt-3">
            <small className="text-warning">
              <Icon name="info" /> You have unsaved changes
            </small>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="light" onClick={handleCancel}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave} disabled={!hasChanges}>
          Save Order
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReorderBanners;
