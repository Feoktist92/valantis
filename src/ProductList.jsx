import React, { useState, useEffect } from 'react';
import axios from 'axios';
import md5 from 'md5';

const apiUrl = 'http://api.valantis.store:40000/';
const password = 'Valantis';
const itemsPerPage = 50;

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ name: '', price: '', brand: '' });
    const [error, setError] = useState(null);
    const [allProductIds, setAllProductIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (allProductIds.length > 0) {
            fetchProducts();
        }
    }, [currentPage, allProductIds]);

    useEffect(() => {
        const totalItems = allProductIds.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        setTotalPages(totalPages);
    }, [allProductIds]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const authString = md5(`${password}_${timestamp}`);

            const idsResponse = await axios.post(
                apiUrl,
                {
                    action: 'get_ids',
                    params: { offset: 0, limit: 500 }
                },
                { headers: { 'X-Auth': authString } }
            );

            const uniqueIds = Array.from(new Set(idsResponse.data.result));
            setAllProductIds(uniqueIds);
            setIsLoading(false);
        } catch (error) {
            handleFetchError(error);
        }
    };

    const fetchProducts = async () => {
        try {
            const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const authString = md5(`${password}_${timestamp}`);
            const offset = (currentPage - 1) * itemsPerPage;
            const idsToFetch = allProductIds.slice(offset, offset + itemsPerPage);

            const response = await axios.post(
                apiUrl,
                { action: 'get_items', params: { ids: idsToFetch } },
                { headers: { 'X-Auth': authString } }
            );

            const uniqueProducts = filterUniqueProducts(response.data.result);
            setProducts(uniqueProducts);
        } catch (error) {
            handleFetchError(error);
        }
    };

    const filterUniqueProducts = (products) => {
        const uniqueIds = new Set();
        const uniqueProducts = [];

        products.forEach(product => {
            if (!uniqueIds.has(product.id)) {
                uniqueIds.add(product.id);
                uniqueProducts.push(product);
            }
        });

        return uniqueProducts;
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    };

    const handleFilterPrice = async () => {
        try {
            const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const authString = md5(`${password}_${timestamp}`);

            const response = await axios.post(
                apiUrl,
                { action: 'filter', params: { 'price': Number(filters.price) } },
                { headers: { 'X-Auth': authString } }
            );

            setAllProductIds(response.data.result);
            setCurrentPage(1);
        } catch (error) {
            handleFetchError(error);
        }
    };

    const handleFilterBrand = async () => {
        try {
            const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const authString = md5(`${password}_${timestamp}`);

            const response = await axios.post(
                apiUrl,
                { action: 'filter', params: { 'brand': filters.brand } },
                { headers: { 'X-Auth': authString } }
            );

            setAllProductIds(response.data.result);
            setCurrentPage(1);
        } catch (error) {
            handleFetchError(error);
        }
    };

    const handleFilterName = async () => {
        try {
            const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const authString = md5(`${password}_${timestamp}`);

            const response = await axios.post(
                apiUrl,
                { action: 'filter', params: { 'name': filters.name } },
                { headers: { 'X-Auth': authString } }
            );

            setAllProductIds(response.data.result);
            setCurrentPage(1);
        } catch (error) {
            handleFetchError(error);
        }
    };


    const handleFetchError = (error) => {
        setError(error);
        console.error('Error:', error.response?.status || error.message);
        if (error.response?.status === 401) {
            alert('Invalid API key. Please check your API key and try again.');
        } else if (error.response?.status === 500) {
            setTimeout(fetchData, 1000);
        } else {
            fetchData();
        }
    };

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            <h1 className='title'>Goods List</h1>
            <div className='filters'>
                <label>
                    <input name="name" placeholder="name" value={filters.name} onChange={handleFilterChange} />
                    <button className='btn' onClick={handleFilterName}>Найти</button>
                </label>
                <label>
                    <input name="price" placeholder="price" value={filters.price} onChange={handleFilterChange} />
                    <button className='btn' onClick={handleFilterPrice}>Найти</button>
                </label>
                <label>
                    <input name="brand" placeholder="brand" value={filters.brand} onChange={handleFilterChange} />
                    <button className='btn' onClick={handleFilterBrand}>Найти</button>
                </label>
            </div>
            {isLoading ? <h2>Loading...</h2> :
                <>
                    <ol>
                        {products.map(product => (
                            <li className='product' key={product.id}>
                                <div>ID: {product.id}</div>
                                <div>Name: {product.product}</div>
                                <div>Price: {product.price}</div>
                                <div>Brand: {product.brand}</div>
                            </li>
                        ))}
                    </ol>
                    <div className='pagination'>
                        {currentPage > 1 && (
                            <button className='btn' onClick={() => handlePageChange(currentPage - 1)}>Prev</button>
                        )}
                        <span>{currentPage}/{totalPages}</span>
                        {currentPage < totalPages && (
                            <button className='btn' onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                        )}
                    </div>
                </>}

        </div>
    );
};

export default ProductList;
