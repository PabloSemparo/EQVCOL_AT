import { test, expect } from '@playwright/test';
import contractorData from '../Test\'s Data/contractorData.json';
const API_URL = process.env.API_URL || 'http://eq-dc-debt-importer.test2.mmk.local/admin/v1/contractors';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'eyJraWQiOiJzbWZ0cC1rZXkiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsIm5iZiI6MTcwMTA5Nzc2Nywic2NvcGUiOiJBRE1JTiIsImlzcyI6InNlbGYiLCJleHAiOjIwMTY0NTc3NjcsImlhdCI6MTcwMTA5Nzc2N30.euDaDutoZtG5-_t3HcLPK5LmjVUYwE961AerMgJ4QwQAPDa0Kdamk6b83TnbAI5k3HJD3j2kZMWxM8IRbO1GgUu_rKTHwyfjhQaW5vX2bDkb74E9JeVaq91kXUAa4craFSBjKlS8_oZsCSiifWU297FsDpJTC7-ezn8saMNi4uUeA4pAuEJxbWXhpLh06G0jaHfQec3EtphsTSP-_VvKUGdwToUZ3jcuDEfB4OECAYAeCjs1lW5CJ7Ngxtrlcrj6l_Tu5URDrLejGe9ikcq_Lg7sAQ_4TpoNiS4K7iPjuEURX37DsUoOHff_Ex2PTlM27XusDBT_splBLsZjlHri7w';

test.describe('Тесты API создания контрагентов', () => {
    test('POST /contractors - Создание контрагента с валидными данными', async ({ request }) => {
        const response = await request.post(API_URL, {
                headers: { Authorization: `Bearer ${AUTH_TOKEN}`},
            data: contractorData
        });

        expect(response.status()).toBe(201);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('id');
    });

    test('POST /contractors - Должен возвращать ошибку при невалидном токене [401 CODE]', async ({ request }) => {
        const response = await request.post(API_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'invalid_token'
            },
            data: {
                name: "Быстроденги",
                inn: "5544332219",
                status: "DRAFT"
            }
        });

        expect(response.status()).toBe(401);
    });

    test('POST /contractors - Должен возвращать ошибку при отсутствии обязательных полей', async ({ request }) => {
        const response = await request.post(API_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            data: {
                // Отсутствуют обязательные поля name и inn
                status: "DRAFT"
            }
        });

        expect(response.status()).toBe(400);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('errors');
        expect(responseBody.errors).toContainEqual(
            expect.objectContaining({
                code: "FIELD_REQUIRED",
                description: "Отсутствует обязательное поле name",
                key: "name"
        }));
        expect(responseBody.errors).toContainEqual(
            expect.objectContaining({
                code: "FIELD_REQUIRED",
                description: "Отсутствует обязательное поле name",
                key: "name"
        }));
    });

    test('POST /contractors - Должен возвращать ошибку при неверном формате ИНН', async ({ request }) => {
        const response = await request.post(API_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            data: {
                name: "Быстроденги",
                inn: "invalid_inn",
                status: "DRAFT"
            }
        });

        expect(response.status()).toBe(400);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('errors');
        expect(responseBody.errors).toContainEqual(
            expect.objectContaining({
                code: "FIELD_REQUIRED",
                description: "Отсутствует обязательное поле description",
                key: "description"
        }));
    });

    test('POST /contractors - Должен возвращать ошибку при невалидном статусе', async ({ request }) => {
        const response = await request.post(API_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            data: {
                name: "Быстроденги",
                inn: "5544332219",
                status: "INVALID_STATUS"
            }
        });

        expect(response.status()).toBe(400);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('errors');
        expect(responseBody.errors).toContainEqual(
            expect.objectContaining({
                code: "INVALID_FIELD_FORMAT",
                description: "Поле status должно иметь тип class ru.bd.eq.dc.debt.importer.entity.ContractorDetail$Status",
                key: "status"
        }));
    });
})