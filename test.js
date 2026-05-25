fetch("http://localhost:3000/api/reservations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    productId: "PARA-001",
    warehouseId: "CHN-001",
    quantity: 1
  })
})
.then(async (res) => {
  const text = await res.text()
  console.log("RAW RESPONSE:", text)
})
.catch((error) => {
  console.error("ERROR:", error)
})