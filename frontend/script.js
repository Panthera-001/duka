document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.includes("index.html") || path.endsWith("/")) {
    fetchProducts();
  } else if (path.includes("cart.html")) {
    loadCartItems();
  }
  if (!['login.html', 'register.html'].some(page => path.includes(page))) {
  // Check if user is logged in
  fetch('http://localhost:5000/api/auth/me')
    .then(res => {
      if (res.status === 401) {
        alert("You must be logged in");
        window.location.href = "login.html";
      }
    })
    .catch(() => {
      window.location.href = "login.html";
    });
}
});

function fetchProducts() {
  fetch('http://localhost:5000/api/products')
    .then(res => res.json())
    .then(products => {
      const productList = document.getElementById('product-list');
      productList.innerHTML = '';
      products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${product.image_url}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
          <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productList.appendChild(card);
      });
    })
    .catch(err => console.error("Error fetching products:", err));
}

function addToCart(productId) {
  fetch('http://localhost:5000/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ product_id: productId })
  })
    .then(res => res.json())
    .then(data => {
      alert('Product added to cart!');
      console.log(data);
    })
    .catch(err => {
      alert('Failed to add item to cart.');
      console.error("Error adding to cart:", err);
    });
}

function loadCartItems() {
  fetch('http://localhost:5000/api/cart')
    .then(res => res.json())
    .then(items => {
      const tbody = document.querySelector('#cart-table tbody');
      const totalEl = document.getElementById('cart-total');
      tbody.innerHTML = '';

      let grandTotal = 0;

      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Your cart is empty.</td></tr>';
        totalEl.textContent = 'Total: $0.00';
        return;
      }

      items.forEach(item => {
        const row = document.createElement('tr');
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;

        row.innerHTML = `
          <td>${item.name}</td>
          <td>$${parseFloat(item.price).toFixed(2)}</td>
          <td>
            <input type="number" min="1" value="${item.quantity}" style="width:60px;" onchange="updateCartItem(${item.id}, this.value)">
          </td>
          <td>$${itemTotal.toFixed(2)}</td>
          <td><span class="btn-remove" onclick="removeFromCart(${item.id})">Remove</span></td>
        `;
        tbody.appendChild(row);
      });

      totalEl.textContent = `Total: $${grandTotal.toFixed(2)}`;
    })
    .catch(err => {
      console.error("Error loading cart items:", err);
      document.querySelector('#cart-table tbody').innerHTML =
        '<tr><td colspan="5">Error loading cart items.</td></tr>';
    });
}

function removeFromCart(productId) {
  if (!confirm("Are you sure you want to remove this item?")) return;

  fetch(`http://localhost:5000/api/cart/${productId}`, {
    method: 'DELETE'
  })
    .then(res => res.json())
    .then(data => {
      alert('Item removed');
      loadCartItems(); // Refresh cart view
    })
    .catch(err => {
      alert('Failed to remove item.');
      console.error("Error removing from cart:", err);
    });
}

function updateCartItem(productId, quantity) {
  quantity = parseInt(quantity);
  if (isNaN(quantity) || quantity < 1) {
    alert("Please enter a valid quantity");
    return;
  }

  fetch(`http://localhost:5000/api/cart/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quantity })
  })
    .then(res => res.json())
    .then(data => {
      alert('Quantity updated');
      loadCartItems(); // Refresh cart view
    })
    .catch(err => {
      alert('Failed to update quantity.');
      console.error("Error updating cart item:", err);
    });
}